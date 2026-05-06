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
import { tagSchema } from "@/modules/tags/schemas";
import { authorized } from "@/procedures/authorized";
import { normalizeNoteContent, noteContentSchema } from "../content/schema";
import { noteSchema } from "../schemas";

export const updateNoteRequestDtoSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  content: noteContentSchema.optional(),
  folderId: z.uuid().nullish().optional(),
  tagNames: z.array(z.string().trim().min(1).max(60)).max(25).optional(),
  pinned: z.boolean().optional(),
  favorite: z.boolean().optional(),
});

export const updateNoteResponseDtoSchema = noteSchema.extend({
  folder: folderSchema
    .pick({ id: true, name: true, parentId: true })
    .nullable(),
  tags: z.array(tagSchema.pick({ id: true, name: true, slug: true })),
});

export const updateNote = authorized
  .input(updateNoteRequestDtoSchema)
  .output(updateNoteResponseDtoSchema)
  .errors({ NOT_FOUND: {}, BAD_REQUEST: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const [existingNote] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.id, input.id), eq(notes.userId, userId)))
      .limit(1);

    if (!existingNote) {
      throw errors.NOT_FOUND({
        message: "Note not found.",
        data: { id: input.id },
      });
    }

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

    const normalized = input.content
      ? normalizeNoteContent(input.content)
      : undefined;
    const linkedNoteIds = normalized
      ? [...new Set(normalized.linkedNoteIds)]
      : undefined;

    if (linkedNoteIds && linkedNoteIds.length > 0) {
      const activeLinkedNotes = await db
        .select({ id: notes.id })
        .from(notes)
        .where(
          and(
            eq(notes.userId, userId),
            isNull(notes.archivedAt),
            inArray(notes.id, linkedNoteIds)
          )
        );

      if (activeLinkedNotes.length !== linkedNoteIds.length) {
        throw errors.BAD_REQUEST({
          message:
            "Content links to a missing, archived, or inaccessible note.",
        });
      }
    }

    const tagRows: { id: string; name: string; slug: string }[] = [];

    if (input.tagNames !== undefined) {
      const tagValues = new Map<
        string,
        { id: string; name: string; slug: string }
      >();

      for (const tagName of input.tagNames) {
        const name = tagName.trim().replace(/\s+/g, " ");
        const slug = name
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        if (!slug) {
          throw errors.BAD_REQUEST({
            message: "Tag name must contain letters or numbers.",
          });
        }

        tagValues.set(slug, { id: crypto.randomUUID(), name, slug });
      }

      tagRows.push(...tagValues.values());
    }

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(notes)
        .set({
          title: input.title,
          content: normalized?.content,
          contentText: normalized?.contentText,
          folderId: input.folderId === undefined ? undefined : input.folderId,
          pinned: input.pinned,
          favorite: input.favorite,
          updatedAt: new Date(),
        })
        .where(and(eq(notes.id, input.id), eq(notes.userId, userId)))
        .returning();

      if (!updated) {
        throw errors.NOT_FOUND({
          message: "Note not found.",
          data: { id: input.id },
        });
      }

      if (input.tagNames !== undefined) {
        if (tagRows.length > 0) {
          await tx
            .insert(noteTags)
            .values(tagRows.map((tag) => ({ ...tag, userId })))
            .onConflictDoUpdate({
              target: [noteTags.userId, noteTags.slug],
              set: { updatedAt: new Date() },
            });
        }

        let tags: { id: string }[] = [];

        if (tagRows.length > 0) {
          tags = await tx
            .select({ id: noteTags.id })
            .from(noteTags)
            .where(
              and(
                eq(noteTags.userId, userId),
                inArray(
                  noteTags.slug,
                  tagRows.map((tag) => tag.slug)
                )
              )
            );
        }

        await tx.delete(notesToTags).where(eq(notesToTags.noteId, input.id));

        if (tags.length > 0) {
          await tx.insert(notesToTags).values(
            tags.map((tag) => ({
              noteId: input.id,
              tagId: tag.id,
            }))
          );
        }
      }

      if (linkedNoteIds) {
        await tx.delete(noteLinks).where(eq(noteLinks.sourceNoteId, input.id));

        if (linkedNoteIds.length > 0) {
          await tx.insert(noteLinks).values(
            linkedNoteIds.map((targetNoteId) => ({
              userId,
              sourceNoteId: input.id,
              targetNoteId,
            }))
          );
        }
      }
    });

    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, input.id), eq(notes.userId, userId)))
      .limit(1);

    if (!note) {
      throw errors.NOT_FOUND({
        message: "Note not found.",
        data: { id: input.id },
      });
    }

    const tags = await db
      .select({
        id: noteTags.id,
        name: noteTags.name,
        slug: noteTags.slug,
      })
      .from(notesToTags)
      .innerJoin(noteTags, eq(noteTags.id, notesToTags.tagId))
      .where(and(eq(notesToTags.noteId, note.id), eq(noteTags.userId, userId)));

    const [folder] = note.folderId
      ? await db
          .select({
            id: noteFolders.id,
            name: noteFolders.name,
            parentId: noteFolders.parentId,
          })
          .from(noteFolders)
          .where(
            and(
              eq(noteFolders.id, note.folderId),
              eq(noteFolders.userId, userId)
            )
          )
          .limit(1)
      : [];

    return updateNoteResponseDtoSchema.parse({
      id: note.id,
      userId: note.userId,
      folderId: note.folderId,
      title: note.title,
      content: note.content,
      folder: folder ?? null,
      tags,
      pinned: note.pinned,
      favorite: note.favorite,
      archivedAt: note.archivedAt,
      archiveExpiresAt: note.archiveExpiresAt,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  });
