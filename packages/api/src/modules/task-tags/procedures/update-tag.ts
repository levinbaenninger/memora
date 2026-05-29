import { z } from "zod";

import { db } from "@memora/db";
import { and, eq, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { tagNameAlphanumericPattern, tagSchema } from "../schemas";

const TASK_TAG_NAME_UNIQUE_CONSTRAINT = "task_tags_user_name_unique";

function isTaskTagNameConflict(error: unknown): boolean {
  let current: unknown = error;

  while (current && typeof current === "object") {
    const record = current as {
      code?: string;
      constraint?: string;
      cause?: unknown;
    };

    if (
      record.code === "23505" &&
      (!record.constraint ||
        record.constraint === TASK_TAG_NAME_UNIQUE_CONSTRAINT)
    ) {
      return true;
    }

    current = record.cause;
  }

  return false;
}

export const updateTagRequestDtoSchema = z.object({
  id: z.nanoid(),
  name: z.string().trim().min(1).max(60),
});

export const updateTagResponseDtoSchema = tagSchema;

export const updateTag = authorized
  .input(updateTagRequestDtoSchema)
  .output(updateTagResponseDtoSchema)
  .errors({ BAD_REQUEST: {}, CONFLICT: {}, NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const name = input.name.trim().replace(/\s+/g, " ");

    if (!tagNameAlphanumericPattern.test(name)) {
      throw errors.BAD_REQUEST({
        message: "Tag name must contain letters or numbers.",
      });
    }

    let tag: typeof taskTags.$inferSelect | undefined;

    try {
      [tag] = await db
        .update(taskTags)
        .set({ name, updatedAt: new Date() })
        .where(and(eq(taskTags.id, input.id), eq(taskTags.userId, userId)))
        .returning();
    } catch (error) {
      if (isTaskTagNameConflict(error)) {
        throw errors.CONFLICT({
          message: "Tag name already exists.",
        });
      }

      throw error;
    }

    if (!tag) {
      throw errors.NOT_FOUND({
        message: "Tag not found.",
        data: { id: input.id },
      });
    }

    return updateTagResponseDtoSchema.parse(tag);
  });
