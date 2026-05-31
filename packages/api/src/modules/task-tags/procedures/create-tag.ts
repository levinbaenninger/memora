import { z } from "zod";

import { db } from "@memora/db";
import { taskTags } from "@memora/db/schema";

import {
  hasAlphanumericContent,
  normalizeTagName,
} from "../../../lib/tag-name";
import { authorized } from "../../../procedures/authorized";
import { tagSchema } from "../schemas";

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

    const [tag] = await db
      .insert(taskTags)
      .values({ userId, name })
      .onConflictDoUpdate({
        target: [taskTags.userId, taskTags.name],
        set: { updatedAt: new Date() },
      })
      .returning();

    if (!tag) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Internal server error.",
      });
    }

    return createTagResponseDtoSchema.parse(tag);
  });
