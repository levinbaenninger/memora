import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes } from "@memora/db/schema";

import { authorized } from "@/procedures/authorized";

export const restoreNoteRequestDtoSchema = z.object({
  id: z.uuid(),
});

export const restoreNoteResponseDtoSchema = z.object({
  id: z.string(),
});

export const restoreNote = authorized
  .input(restoreNoteRequestDtoSchema)
  .output(restoreNoteResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, input.id), eq(notes.userId, userId)))
      .limit(1);

    if (!note?.archivedAt) {
      throw errors.NOT_FOUND({
        message: "Archived note not found.",
        data: { id: input.id },
      });
    }

    if (note.folderId) {
      const [folder] = await db
        .select({ id: noteFolders.id })
        .from(noteFolders)
        .where(
          and(
            eq(noteFolders.id, note.folderId),
            eq(noteFolders.userId, userId),
            isNull(noteFolders.archivedAt)
          )
        )
        .limit(1);

      if (!folder) {
        throw errors.NOT_FOUND({
          message: "Folder not found.",
          data: { id: note.folderId },
        });
      }
    }

    const [restored] = await db
      .update(notes)
      .set({
        archivedAt: null,
        archiveExpiresAt: null,
        archiveOriginId: null,
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, input.id), eq(notes.userId, userId)))
      .returning();

    if (!restored) {
      throw errors.NOT_FOUND({
        message: "Archived note not found.",
        data: { id: input.id },
      });
    }

    return restoreNoteResponseDtoSchema.parse({ id: input.id });
  });
