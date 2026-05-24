import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteShares, notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { shareSchema } from "../schemas";

export const listSharesRequestDtoSchema = z.object({
  noteId: z.nanoid(),
});

export const listSharesResponseDtoSchema = z.array(shareSchema);

export const listShares = authorized
  .input(listSharesRequestDtoSchema)
  .output(listSharesResponseDtoSchema)
  .errors({
    NOT_FOUND: {},
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    const [note] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.id, input.noteId), eq(notes.userId, userId)))
      .limit(1);

    if (!note) {
      throw errors.NOT_FOUND({ message: "Note not found." });
    }

    const now = new Date();
    const rows = await db
      .select()
      .from(noteShares)
      .where(
        and(
          eq(noteShares.noteId, input.noteId),
          or(isNull(noteShares.expiresAt), gt(noteShares.expiresAt, now))
        )
      )
      .orderBy(noteShares.createdAt);

    return listSharesResponseDtoSchema.parse(rows);
  });
