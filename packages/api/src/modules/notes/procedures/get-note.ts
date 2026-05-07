import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes, notesToTags, noteTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { folderSchema } from "../../folders/schemas";
import { tagSchema } from "../../tags/schemas";
import { noteSchema } from "../schemas";

export const getNoteRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const getNoteResponseDtoSchema = noteSchema.extend({
  folder: folderSchema
    .pick({ id: true, name: true, parentId: true })
    .nullable(),
  tags: z.array(tagSchema.pick({ id: true, name: true, slug: true })),
});

export const getNote = authorized
  .input(getNoteRequestDtoSchema)
  .output(getNoteResponseDtoSchema)
  .errors({
    NOT_FOUND: {
      message: "Note not found.",
      data: z.object({
        id: getNoteRequestDtoSchema.shape.id,
      }),
    },
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
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

    return getNoteResponseDtoSchema.parse({
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
