import { eq } from "drizzle-orm";

import { db } from "@memora/db";
import { noteTags } from "@memora/db/schema";

import { authorized } from "@/procedures/authorized";
import { tagSchema } from "../schemas";

export const listTagsResponseDtoSchema = tagSchema.array();

export const listTags = authorized
  .output(listTagsResponseDtoSchema)
  .handler(async ({ context }) => {
    const tags = await db
      .select()
      .from(noteTags)
      .where(eq(noteTags.userId, context.user.id))
      .orderBy(noteTags.name);

    return listTagsResponseDtoSchema.parse(tags);
  });
