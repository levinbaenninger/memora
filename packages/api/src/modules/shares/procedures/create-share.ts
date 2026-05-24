import { and, count, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { notes, noteShares } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { MAX_ACTIVE_SHARES_PER_NOTE } from "../constants";
import { expiryPresetSchema, expiryPresetToDate, shareSchema } from "../schemas";

export const createShareRequestDtoSchema = z.object({
  noteId: z.nanoid(),
  expiry: expiryPresetSchema.default("none"),
});

export const createShareResponseDtoSchema = shareSchema;

export const createShare = authorized
  .input(createShareRequestDtoSchema)
  .output(createShareResponseDtoSchema)
  .errors({
    NOT_FOUND: {},
    BAD_REQUEST: {},
    INTERNAL_SERVER_ERROR: {},
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    const [note] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(
        and(
          eq(notes.id, input.noteId),
          eq(notes.userId, userId),
          isNull(notes.archivedAt)
        )
      )
      .limit(1);

    if (!note) {
      throw errors.NOT_FOUND({ message: "Note not found." });
    }

    const now = new Date();
    const [activeCount] = await db
      .select({ value: count() })
      .from(noteShares)
      .where(
        and(
          eq(noteShares.noteId, input.noteId),
          or(isNull(noteShares.expiresAt), gt(noteShares.expiresAt, now))
        )
      );

    if ((activeCount?.value ?? 0) >= MAX_ACTIVE_SHARES_PER_NOTE) {
      throw errors.BAD_REQUEST({
        message: `A note can have at most ${MAX_ACTIVE_SHARES_PER_NOTE} active share links. Revoke an existing link before creating a new one.`,
      });
    }

    const expiresAt = expiryPresetToDate(input.expiry);

    const [created] = await db
      .insert(noteShares)
      .values({ noteId: input.noteId, expiresAt })
      .returning();

    if (!created) {
      throw errors.INTERNAL_SERVER_ERROR({});
    }

    return createShareResponseDtoSchema.parse(created);
  });
