import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { taskTags } from "@memora/db/schema";

import { isUniqueViolation } from "../../../lib/db-errors";
import {
  hasAlphanumericContent,
  normalizeTagName,
} from "../../../lib/tag-name";
import { authorized } from "../../../procedures/authorized";
import { tagSchema } from "../schemas";

const TASK_TAG_NAME_UNIQUE_CONSTRAINT = "task_tags_user_name_unique";

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

    try {
      const [tag] = await db
        .insert(taskTags)
        .values({ userId, name })
        .returning();

      if (!tag) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Internal server error.",
        });
      }

      return createTagResponseDtoSchema.parse(tag);
    } catch (error) {
      if (!isUniqueViolation(error, TASK_TAG_NAME_UNIQUE_CONSTRAINT)) {
        throw error;
      }
    }

    const [tag] = await db
      .select()
      .from(taskTags)
      .where(and(eq(taskTags.userId, userId), eq(taskTags.name, name)))
      .limit(1);

    if (!tag) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Internal server error.",
      });
    }

    return createTagResponseDtoSchema.parse(tag);
  });
