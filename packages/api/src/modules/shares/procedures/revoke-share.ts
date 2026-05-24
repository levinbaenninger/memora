import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteShares, notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";

export const revokeShareRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const revokeShareResponseDtoSchema = z.object({
  id: z.string(),
});

export const revokeShare = authorized
  .input(revokeShareRequestDtoSchema)
  .output(revokeShareResponseDtoSchema)
  .errors({
    NOT_FOUND: {},
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    const [row] = await db
      .select({ id: noteShares.id })
      .from(noteShares)
      .innerJoin(notes, eq(notes.id, noteShares.noteId))
      .where(and(eq(noteShares.id, input.id), eq(notes.userId, userId)))
      .limit(1);

    if (!row) {
      throw errors.NOT_FOUND({ message: "Share link not found." });
    }

    await db.delete(noteShares).where(eq(noteShares.id, row.id));

    return { id: row.id };
  });
