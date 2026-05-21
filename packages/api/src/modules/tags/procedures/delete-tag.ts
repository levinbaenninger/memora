import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";

export const deleteTagRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const deleteTagResponseDtoSchema = z.object({
  id: z.string(),
});

export const deleteTag = authorized
  .input(deleteTagRequestDtoSchema)
  .output(deleteTagResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const [deleted] = await db
      .delete(noteTags)
      .where(
        and(eq(noteTags.id, input.id), eq(noteTags.userId, context.user.id))
      )
      .returning({ id: noteTags.id });

    if (!deleted) {
      throw errors.NOT_FOUND({
        message: "Tag not found.",
        data: { id: input.id },
      });
    }

    return deleted;
  });
