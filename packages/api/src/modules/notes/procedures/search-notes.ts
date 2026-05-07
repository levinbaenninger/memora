import type { SQL } from "drizzle-orm";
import { and, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes, notesToTags, noteTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { folderSchema } from "../../folders/schemas";
import { paginationSchema } from "../../shared/pagination";
import { tagSchema } from "../../tags/schemas";
import { noteSchema } from "../schemas";

export const searchNotesRequestDtoSchema = paginationSchema.extend({
  folderId: z.nanoid().nullish(),
  includeArchived: z.boolean().default(false),
  query: z.string().trim().min(1).max(200),
  tagIds: z.array(z.nanoid()).max(25).default([]),
});

export const searchNotesResponseDtoSchema = z.array(
  noteSchema.omit({ content: true }).extend({
    folder: folderSchema
      .pick({ id: true, name: true, parentId: true })
      .nullable(),
    snippet: z.string(),
    tags: z.array(tagSchema.pick({ id: true, name: true, slug: true })),
  })
);

export const searchNotes = authorized
  .input(searchNotesRequestDtoSchema)
  .output(searchNotesResponseDtoSchema)
  .errors({ NOT_FOUND: {}, BAD_REQUEST: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    if (input.folderId) {
      const [folder] = await db
        .select({ id: noteFolders.id })
        .from(noteFolders)
        .where(
          and(
            eq(noteFolders.id, input.folderId),
            eq(noteFolders.userId, userId),
            isNull(noteFolders.archivedAt)
          )
        )
        .limit(1);

      if (!folder) {
        throw errors.NOT_FOUND({
          message: "Folder not found.",
          data: { id: input.folderId },
        });
      }
    }

    let candidateNoteIds: string[] | undefined;

    if (input.tagIds.length > 0) {
      const matchedTags = await db
        .select({ noteId: notesToTags.noteId })
        .from(notesToTags)
        .innerJoin(noteTags, eq(noteTags.id, notesToTags.tagId))
        .where(
          and(eq(noteTags.userId, userId), inArray(noteTags.id, input.tagIds))
        );

      candidateNoteIds = [
        ...new Set(matchedTags.map((noteTag) => noteTag.noteId)),
      ];

      if (candidateNoteIds.length === 0) {
        return [];
      }
    }

    const searchWhere = or(
      sql`to_tsvector('simple', coalesce(${notes.title}, '') || ' ' || coalesce(${notes.contentText}, '')) @@ plainto_tsquery('simple', ${input.query})`,
      ilike(notes.title, `%${input.query}%`),
      ilike(notes.contentText, `%${input.query}%`)
    );

    if (!searchWhere) {
      throw errors.BAD_REQUEST({ message: "Invalid search query." });
    }

    const where: SQL[] = [eq(notes.userId, userId), searchWhere];

    if (!input.includeArchived) {
      where.push(isNull(notes.archivedAt));
    }

    if (input.folderId !== undefined) {
      where.push(
        input.folderId
          ? eq(notes.folderId, input.folderId)
          : isNull(notes.folderId)
      );
    }

    if (candidateNoteIds) {
      where.push(inArray(notes.id, candidateNoteIds));
    }

    const foundNotes = await db
      .select()
      .from(notes)
      .where(and(...where))
      .orderBy(
        desc(
          sql`ts_rank(to_tsvector('simple', coalesce(${notes.title}, '') || ' ' || coalesce(${notes.contentText}, '')), plainto_tsquery('simple', ${input.query}))`
        ),
        desc(notes.updatedAt)
      )
      .limit(input.limit)
      .offset(input.offset);

    const noteIds = foundNotes.map((note) => note.id);
    const tagLinks =
      noteIds.length > 0
        ? await db
            .select({
              noteId: notesToTags.noteId,
              id: noteTags.id,
              name: noteTags.name,
              slug: noteTags.slug,
            })
            .from(notesToTags)
            .innerJoin(noteTags, eq(noteTags.id, notesToTags.tagId))
            .where(
              and(
                inArray(notesToTags.noteId, noteIds),
                eq(noteTags.userId, userId)
              )
            )
        : [];

    const tagsByNoteId = new Map<
      string,
      { id: string; name: string; slug: string }[]
    >();

    for (const tagLink of tagLinks) {
      const tags = tagsByNoteId.get(tagLink.noteId) ?? [];
      tags.push({ id: tagLink.id, name: tagLink.name, slug: tagLink.slug });
      tagsByNoteId.set(tagLink.noteId, tags);
    }

    const folderIds = [
      ...new Set(
        foundNotes.flatMap((note) => (note.folderId ? [note.folderId] : []))
      ),
    ];
    const folderRows =
      folderIds.length > 0
        ? await db
            .select({
              id: noteFolders.id,
              name: noteFolders.name,
              parentId: noteFolders.parentId,
            })
            .from(noteFolders)
            .where(
              and(
                inArray(noteFolders.id, folderIds),
                eq(noteFolders.userId, userId)
              )
            )
        : [];
    const foldersById = new Map(
      folderRows.map((folder) => [folder.id, folder])
    );

    return searchNotesResponseDtoSchema.parse(
      foundNotes.map((note) => {
        const compactText = note.contentText.replace(/\s+/g, " ").trim();
        const queryIndex = compactText
          .toLowerCase()
          .indexOf(input.query.toLowerCase());
        const snippetStart = Math.max(
          queryIndex === -1 ? 0 : queryIndex - 80,
          0
        );

        return {
          id: note.id,
          userId: note.userId,
          folderId: note.folderId,
          title: note.title,
          snippet: compactText.slice(snippetStart, snippetStart + 240),
          folder: note.folderId
            ? (foldersById.get(note.folderId) ?? null)
            : null,
          tags: tagsByNoteId.get(note.id) ?? [],
          pinned: note.pinned,
          favorite: note.favorite,
          archivedAt: note.archivedAt,
          archiveExpiresAt: note.archiveExpiresAt,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        };
      })
    );
  });
