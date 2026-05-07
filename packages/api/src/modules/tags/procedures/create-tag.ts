import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteTags } from "@memora/db/schema";

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
    const name = input.name.trim().replace(/\s+/g, " ");
    const slug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      throw errors.BAD_REQUEST({
        message: "Tag name must contain letters or numbers.",
      });
    }

    await db
      .insert(noteTags)
      .values({ id: crypto.randomUUID(), userId, name, slug })
      .onConflictDoUpdate({
        target: [noteTags.userId, noteTags.slug],
        set: { updatedAt: new Date() },
      });

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
