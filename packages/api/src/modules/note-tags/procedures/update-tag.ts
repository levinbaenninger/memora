import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteTags } from "@memora/db/schema";

import { isUniqueViolation } from "../../../lib/db-errors";
import { authorized } from "../../../procedures/authorized";
import { tagSchema } from "../schemas";

const NOTE_TAG_SLUG_UNIQUE_CONSTRAINT = "note_tags_user_slug_unique";

function isNoteTagNameConflict(error: unknown): boolean {
  return isUniqueViolation(error, NOTE_TAG_SLUG_UNIQUE_CONSTRAINT);
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
    const name = input.name.replace(/\s+/g, " ");
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

    let tag: typeof noteTags.$inferSelect | undefined;

    try {
      [tag] = await db
        .update(noteTags)
        .set({ name, slug, updatedAt: new Date() })
        .where(and(eq(noteTags.id, input.id), eq(noteTags.userId, userId)))
        .returning();
    } catch (error) {
      if (isNoteTagNameConflict(error)) {
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
