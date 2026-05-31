import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteTags } from "@memora/db/schema";

import { isUniqueViolation } from "../../../lib/db-errors";
import {
  hasAlphanumericContent,
  normalizeTagName,
  slugifyTagName,
} from "../../../lib/tag-name";
import { authorized } from "../../../procedures/authorized";
import { tagSchema } from "../schemas";

const NOTE_TAG_SLUG_UNIQUE_CONSTRAINT = "note_tags_user_slug_unique";

export const createTagRequestDtoSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const createTagResponseDtoSchema = tagSchema;

export const createTag = authorized
  .input(createTagRequestDtoSchema)
  .output(createTagResponseDtoSchema)
  .errors({ BAD_REQUEST: {}, INTERNAL_SERVER_ERROR: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const name = normalizeTagName(input.name);

    if (!hasAlphanumericContent(name)) {
      throw errors.BAD_REQUEST({
        message: "Tag name must contain letters or numbers.",
      });
    }

    const slug = slugifyTagName(name);

    try {
      const [tag] = await db
        .insert(noteTags)
        .values({ userId, name, slug })
        .returning();

      if (!tag) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Internal server error.",
        });
      }

      return createTagResponseDtoSchema.parse(tag);
    } catch (error) {
      if (!isUniqueViolation(error, NOTE_TAG_SLUG_UNIQUE_CONSTRAINT)) {
        throw error;
      }
    }

    const [tag] = await db
      .select()
      .from(noteTags)
      .where(and(eq(noteTags.userId, userId), eq(noteTags.slug, slug)))
      .limit(1);

    if (!tag) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Internal server error.",
      });
    }

    return createTagResponseDtoSchema.parse(tag);
  });
