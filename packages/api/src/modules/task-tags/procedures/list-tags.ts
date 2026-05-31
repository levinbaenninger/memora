import { eq } from "drizzle-orm";

import { db } from "@memora/db";
import { taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { tagSchema } from "../schemas";

export const listTagsResponseDtoSchema = tagSchema.array();

export const listTags = authorized
  .output(listTagsResponseDtoSchema)
  .handler(async ({ context }) => {
    const tags = await db
      .select()
      .from(taskTags)
      .where(eq(taskTags.userId, context.user.id))
      .orderBy(taskTags.name);

    return tags;
  });
