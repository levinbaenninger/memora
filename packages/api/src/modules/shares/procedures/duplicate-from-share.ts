import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { notes, noteShares } from "@memora/db/schema";

import { consumeRateLimit } from "../../../middlewares/rate-limit";
import { authorized } from "../../../procedures/authorized";
import { normalizeNoteContent } from "../../notes/content/schema";

export const duplicateFromShareRequestDtoSchema = z.object({
  token: z.string().min(16).max(64),
});

export const duplicateFromShareResponseDtoSchema = z.object({
  id: z.string(),
});

const DUPLICATE_RATE_LIMIT = {
  name: "shares.duplicate",
  limit: 30,
  windowMs: 60 * 60 * 1000,
};

export const duplicateFromShare = authorized
  .input(duplicateFromShareRequestDtoSchema)
  .output(duplicateFromShareResponseDtoSchema)
  .errors({
    NOT_FOUND: { message: "Share link not found." },
    TOO_MANY_REQUESTS: { message: "Too many requests. Try again later." },
    INTERNAL_SERVER_ERROR: {},
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    if (!consumeRateLimit(userId, DUPLICATE_RATE_LIMIT)) {
      throw errors.TOO_MANY_REQUESTS({});
    }

    const now = new Date();
    const [row] = await db
      .select({
        title: notes.title,
        content: notes.content,
        archivedAt: notes.archivedAt,
      })
      .from(noteShares)
      .innerJoin(notes, eq(notes.id, noteShares.noteId))
      .where(
        and(
          eq(noteShares.token, input.token),
          or(isNull(noteShares.expiresAt), gt(noteShares.expiresAt, now))
        )
      )
      .limit(1);

    if (!row || row.archivedAt) {
      throw errors.NOT_FOUND({});
    }

    // Re-normalize content but strip linked-note refs — the visitor has no
    // access to the source workspace's notes, so internal mentions would be
    // broken references in their copy.
    const normalized = normalizeNoteContent(row.content);

    const [created] = await db
      .insert(notes)
      .values({
        userId,
        title: `(Copy) ${row.title}`,
        content: normalized.content,
        contentText: normalized.contentText,
      })
      .returning({ id: notes.id });

    if (!created) {
      throw errors.INTERNAL_SERVER_ERROR({});
    }

    return { id: created.id };
  });
