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

import { authorized } from "../../../procedures/authorized";
import { folderSchema } from "../../folders/schemas";
import { tagSchema } from "../../tags/schemas";
import { normalizeNoteContent, noteContentSchema } from "../content/schema";
import { noteSchema } from "../schemas";

export const createNoteRequestDtoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: noteContentSchema,
  folderId: z.nanoid().nullish(),
  tagNames: z.array(z.string().trim().min(1).max(60)).max(25).default([]),
  pinned: z.boolean().default(false),
  favorite: z.boolean().default(false),
});

export const createNoteResponseDtoSchema = noteSchema.extend({
  folder: folderSchema
    .pick({ id: true, name: true, parentId: true })
    .nullable(),
  tags: z.array(tagSchema.pick({ id: true, name: true, slug: true })),
});

export const createNote = authorized
  .input(createNoteRequestDtoSchema)
  .output(createNoteResponseDtoSchema)
  .errors({
    NOT_FOUND: {},
    BAD_REQUEST: {},
    INTERNAL_SERVER_ERROR: {},
  })
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

    const normalized = normalizeNoteContent(input.content);
    const linkedNoteIds = [...new Set(normalized.linkedNoteIds)];

    if (linkedNoteIds.length > 0) {
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

    let createdNote: typeof notes.$inferSelect | undefined;

    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(notes)
        .values({
          userId,
          folderId: input.folderId ?? null,
          title: input.title,
          content: normalized.content,
          contentText: normalized.contentText,
          pinned: input.pinned,
          favorite: input.favorite,
        })
        .returning();

      if (!created) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Internal server error.",
        });
      }

      const createdNoteId = created.id;
      createdNote = created;

      const tagValues = new Map<string, { name: string; slug: string }>();

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

        tagValues.set(slug, { name, slug });
      }

      const tagRows = [...tagValues.values()];

      if (tagRows.length > 0) {
        await tx
          .insert(noteTags)
          .values(tagRows.map((tag) => ({ ...tag, userId })))
          .onConflictDoUpdate({
            target: [noteTags.userId, noteTags.slug],
            set: { updatedAt: new Date() },
          });
      }

      const tags =
        tagRows.length > 0
          ? await tx
              .select()
              .from(noteTags)
              .where(
                and(
                  eq(noteTags.userId, userId),
                  inArray(
                    noteTags.slug,
                    tagRows.map((tag) => tag.slug)
                  )
                )
              )
          : [];

      if (tags.length > 0) {
        await tx.insert(notesToTags).values(
          tags.map((tag) => ({
            noteId: createdNoteId,
            tagId: tag.id,
          }))
        );
      }

      if (linkedNoteIds.length > 0) {
        await tx.insert(noteLinks).values(
          linkedNoteIds.map((targetNoteId) => ({
            userId,
            sourceNoteId: createdNoteId,
            targetNoteId,
          }))
        );
      }
    });

    if (!createdNote) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Internal server error.",
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
      .where(
        and(eq(notesToTags.noteId, createdNote.id), eq(noteTags.userId, userId))
      );

    const [folder] = createdNote.folderId
      ? await db
          .select({
            id: noteFolders.id,
            name: noteFolders.name,
            parentId: noteFolders.parentId,
          })
          .from(noteFolders)
          .where(
            and(
              eq(noteFolders.id, createdNote.folderId),
              eq(noteFolders.userId, userId)
            )
          )
          .limit(1)
      : [];

    return createNoteResponseDtoSchema.parse({
      id: createdNote.id,
      userId: createdNote.userId,
      folderId: createdNote.folderId,
      title: createdNote.title,
      content: createdNote.content,
      folder: folder ?? null,
      tags,
      pinned: createdNote.pinned,
      favorite: createdNote.favorite,
      archivedAt: createdNote.archivedAt,
      archiveExpiresAt: createdNote.archiveExpiresAt,
      createdAt: createdNote.createdAt,
      updatedAt: createdNote.updatedAt,
    });
  });
