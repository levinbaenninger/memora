import type { SQL } from "drizzle-orm";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import {
  noteFolders,
  noteLinks,
  notes,
  notesToTags,
  noteTags,
} from "@memora/db/schema";

import { folderSchema } from "@/modules/folders/schemas";
import { noteSchema } from "@/modules/notes/schemas";
import { tagSchema } from "@/modules/tags/schemas";
import { authorized } from "@/procedures/authorized";

export const getBacklinksRequestDtoSchema = z.object({
  id: z.uuid(),
  includeArchived: z.boolean().default(false),
});

export const getBacklinksResponseDtoSchema = z.array(
  noteSchema.omit({ content: true }).extend({
    folder: folderSchema
      .pick({ id: true, name: true, parentId: true })
      .nullable(),
    snippet: z.string(),
    tags: z.array(tagSchema.pick({ id: true, name: true, slug: true })),
  })
);

export const getBacklinks = authorized
  .input(getBacklinksRequestDtoSchema)
  .output(getBacklinksResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const [targetNote] = await db
      .select({ id: notes.id, archivedAt: notes.archivedAt })
      .from(notes)
      .where(and(eq(notes.id, input.id), eq(notes.userId, userId)))
      .limit(1);

    if (!targetNote || (!input.includeArchived && targetNote.archivedAt)) {
      throw errors.NOT_FOUND({
        message: "Note not found.",
        data: { id: input.id },
      });
    }

    const where: SQL[] = [
      eq(noteLinks.userId, userId),
      eq(noteLinks.targetNoteId, input.id),
      eq(notes.userId, userId),
    ];

    if (!input.includeArchived) {
      where.push(isNull(notes.archivedAt));
    }

    const linkedNotes = await db
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
      .from(noteLinks)
      .innerJoin(notes, eq(notes.id, noteLinks.sourceNoteId))
      .where(and(...where))
      .orderBy(notes.title);

    const noteIds = linkedNotes.map((note) => note.id);
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
        linkedNotes.flatMap((note) => (note.folderId ? [note.folderId] : []))
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

    return getBacklinksResponseDtoSchema.parse(
      linkedNotes.map((note) => ({
        id: note.id,
        userId: note.userId,
        folderId: note.folderId,
        title: note.title,
        snippet: note.contentText.replace(/\s+/g, " ").trim().slice(0, 240),
        folder: note.folderId ? (foldersById.get(note.folderId) ?? null) : null,
        tags: tagsByNoteId.get(note.id) ?? [],
        pinned: note.pinned,
        favorite: note.favorite,
        archivedAt: note.archivedAt,
        archiveExpiresAt: note.archiveExpiresAt,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }))
    );
  });
