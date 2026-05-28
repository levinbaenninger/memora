import type { SQL } from "drizzle-orm";
import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes, notesToTags, noteTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { folderSchema } from "../../folders/schemas";
import { tagSchema } from "../../note-tags/schemas";
import { paginationSchema } from "../../shared/pagination";
import { noteSchema } from "../schemas";

export const searchNotesRequestDtoSchema = paginationSchema.extend({
  folderId: z.nanoid().nullish(),
  includeArchived: z.boolean().default(false),
  archivedOnly: z.boolean().default(false),
  pinned: z.boolean().optional(),
  favorite: z.boolean().optional(),
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

function escapeIlike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

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

    const escapedQuery = escapeIlike(input.query);
    const searchWhere = or(
      sql`to_tsvector('simple', coalesce(${notes.title}, '') || ' ' || coalesce(${notes.contentText}, '')) @@ plainto_tsquery('simple', ${input.query})`,
      ilike(notes.title, `%${escapedQuery}%`),
      ilike(notes.contentText, `%${escapedQuery}%`)
    );

    if (!searchWhere) {
      throw errors.BAD_REQUEST({ message: "Invalid search query." });
    }

    const where: SQL[] = [eq(notes.userId, userId), searchWhere];

    if (input.archivedOnly) {
      where.push(isNotNull(notes.archivedAt));
    } else if (!input.includeArchived) {
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

    if (input.pinned !== undefined) {
      where.push(eq(notes.pinned, input.pinned));
    }

    if (input.favorite !== undefined) {
      where.push(eq(notes.favorite, input.favorite));
    }

    const foundNotes = await db
      .select({
        id: notes.id,
        userId: notes.userId,
        folderId: notes.folderId,
        title: notes.title,
        contentText: notes.contentText,
        pinned: notes.pinned,
        favorite: notes.favorite,
        archivedAt: notes.archivedAt,
        archiveExpiresAt: notes.archiveExpiresAt,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
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
