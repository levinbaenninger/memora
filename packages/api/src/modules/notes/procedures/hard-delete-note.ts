import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";

export const hardDeleteNoteRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const hardDeleteNoteResponseDtoSchema = z.object({
  id: z.string(),
});

export const hardDeleteNote = authorized
  .input(hardDeleteNoteRequestDtoSchema)
  .output(hardDeleteNoteResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const deleted = await db
      .delete(notes)
      .where(
        and(
          eq(notes.id, input.id),
          eq(notes.userId, context.user.id),
          isNotNull(notes.archivedAt)
        )
      )
      .returning({ id: notes.id });

    if (deleted.length === 0) {
      throw errors.NOT_FOUND({
        message: "Archived note not found.",
        data: { id: input.id },
      });
    }

    return hardDeleteNoteResponseDtoSchema.parse({ id: input.id });
  });
