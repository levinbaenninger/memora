import { and, count, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteShares, notes } from "@memora/db/schema";

import { consumeRateLimit } from "../../../middlewares/rate-limit";
import { authorized } from "../../../procedures/authorized";
import { MAX_ACTIVE_SHARES_PER_NOTE } from "../constants";
import {
  expiryPresetSchema,
  expiryPresetToDate,
  shareSchema,
} from "../schemas";

export const createShareRequestDtoSchema = z.object({
  noteId: z.nanoid(),
  expiry: expiryPresetSchema.default("none"),
});

export const createShareResponseDtoSchema = shareSchema;

const CREATE_SHARE_RATE_LIMIT = {
  name: "shares.create",
  limit: 30,
  windowMs: 60 * 60 * 1000,
};

export const createShare = authorized
  .input(createShareRequestDtoSchema)
  .output(createShareResponseDtoSchema)
  .errors({
    NOT_FOUND: {},
    BAD_REQUEST: {},
    INTERNAL_SERVER_ERROR: {},
    TOO_MANY_REQUESTS: { message: "Too many requests. Try again later." },
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    if (!consumeRateLimit(userId, CREATE_SHARE_RATE_LIMIT)) {
      throw errors.TOO_MANY_REQUESTS({});
    }

    const expiresAt = expiryPresetToDate(input.expiry);

    // Lock the note row for the duration of the transaction so concurrent
    // create-share calls for the same note serialize through this section —
    // otherwise two racing requests could both pass the cap check and exceed
    // MAX_ACTIVE_SHARES_PER_NOTE.
    const created = await db.transaction(async (tx) => {
      const [note] = await tx
        .select({ id: notes.id })
        .from(notes)
        .where(
          and(
            eq(notes.id, input.noteId),
            eq(notes.userId, userId),
            isNull(notes.archivedAt)
          )
        )
        .for("update")
        .limit(1);

      if (!note) {
        throw errors.NOT_FOUND({ message: "Note not found." });
      }

      const now = new Date();
      const [activeCount] = await tx
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

      const [row] = await tx
        .insert(noteShares)
        .values({ noteId: input.noteId, expiresAt })
        .returning();

      return row;
    });

    if (!created) {
      throw errors.INTERNAL_SERVER_ERROR({});
    }

    return createShareResponseDtoSchema.parse(created);
  });
