import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteShares, notes } from "@memora/db/schema";
import { user } from "@memora/db/schema/auth";

import {
  consumeRateLimit,
  extractClientIp,
} from "../../../middlewares/rate-limit";
import { base } from "../../../procedures/base";
import { noteContentSchema } from "../../notes/content/schema";

export const getPublicShareRequestDtoSchema = z.object({
  token: z.string().min(16).max(64),
});

export const getPublicShareResponseDtoSchema = z.object({
  title: z.string(),
  content: noteContentSchema,
  ownerName: z.string(),
  updatedAt: z.date(),
});

const PUBLIC_SHARE_RATE_LIMIT = {
  name: "shares.getPublic",
  limit: 60,
  windowMs: 60_000,
};

export const getPublicShare = base
  .input(getPublicShareRequestDtoSchema)
  .output(getPublicShareResponseDtoSchema)
  .errors({
    NOT_FOUND: { message: "Share link not found." },
    TOO_MANY_REQUESTS: {
      message: "Too many requests. Try again later.",
      data: z.object({ retryAfter: z.number() }),
    },
  })
  .handler(async ({ context, input, errors }) => {
    const ip = extractClientIp(context.reqHeaders);
    const rl = await consumeRateLimit(ip, PUBLIC_SHARE_RATE_LIMIT);
    if (!rl.success) {
      throw errors.TOO_MANY_REQUESTS({
        data: { retryAfter: Math.max(0, rl.reset - Date.now()) },
      });
    }
    const now = new Date();
    const [row] = await db
      .select({
        title: notes.title,
        content: notes.content,
        updatedAt: notes.updatedAt,
        archivedAt: notes.archivedAt,
        ownerName: user.name,
      })
      .from(noteShares)
      .innerJoin(notes, eq(notes.id, noteShares.noteId))
      .innerJoin(user, eq(user.id, notes.userId))
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

    return getPublicShareResponseDtoSchema.parse({
      title: row.title,
      content: row.content,
      ownerName: row.ownerName,
      updatedAt: row.updatedAt,
    });
  });
