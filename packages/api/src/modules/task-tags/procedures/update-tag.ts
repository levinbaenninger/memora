import { z } from "zod";

import { db } from "@memora/db";
import { and, eq, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { tagNameAlphanumericPattern, tagSchema } from "../schemas";

export const updateTagRequestDtoSchema = z.object({
  id: z.nanoid(),
  name: z.string().trim().min(1).max(60),
});

export const updateTagResponseDtoSchema = tagSchema;

export const updateTag = authorized
  .input(updateTagRequestDtoSchema)
  .output(updateTagResponseDtoSchema)
  .errors({ BAD_REQUEST: {}, NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const name = input.name.trim().replace(/\s+/g, " ");

    if (!tagNameAlphanumericPattern.test(name)) {
      throw errors.BAD_REQUEST({
        message: "Tag name must contain letters or numbers.",
      });
    }

    const [tag] = await db
      .update(taskTags)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(taskTags.id, input.id), eq(taskTags.userId, userId)))
      .returning();

    if (!tag) {
      throw errors.NOT_FOUND({
        message: "Tag not found.",
        data: { id: input.id },
      });
    }

    return updateTagResponseDtoSchema.parse(tag);
  });
