import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { user } from "@memora/db/schema/auth";
import { notes, noteShares } from "@memora/db/schema";

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

export const getPublicShare = base
  .input(getPublicShareRequestDtoSchema)
  .output(getPublicShareResponseDtoSchema)
  .errors({
    NOT_FOUND: { message: "Share link not found." },
  })
  .handler(async ({ input, errors }) => {
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
