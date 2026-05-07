import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { ARCHIVE_RETENTION_DAYS } from "../constants";

export const archiveNoteRequestDtoSchema = z.object({
  id: z.uuid(),
});

export const archiveNoteResponseDtoSchema = z.object({
  archivedAt: z.date(),
  archiveExpiresAt: z.date(),
  id: z.string(),
});

export const archiveNote = authorized
  .input(archiveNoteRequestDtoSchema)
  .output(archiveNoteResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const now = new Date();
    const archiveExpiresAt = new Date(
      now.getTime() + ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );

    const [archived] = await db
      .update(notes)
      .set({
        archivedAt: now,
        archiveExpiresAt,
        archiveOriginId: input.id,
        updatedAt: now,
      })
      .where(
        and(
          eq(notes.id, input.id),
          eq(notes.userId, userId),
          isNull(notes.archivedAt)
        )
      )
      .returning();

    if (!archived) {
      throw errors.NOT_FOUND({
        message: "Note not found.",
        data: { id: input.id },
      });
    }

    return archiveNoteResponseDtoSchema.parse({
      id: input.id,
      archivedAt: now,
      archiveExpiresAt,
    });
  });
