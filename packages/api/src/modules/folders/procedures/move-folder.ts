import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders } from "@memora/db/schema";

import { authorized } from "@/procedures/authorized";
import { folderSchema } from "../schemas";

export const moveFolderResponseDtoSchema = folderSchema;

export const moveFolderRequestDtoSchema = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullish(),
});

export const moveFolder = authorized
  .input(moveFolderRequestDtoSchema)
  .output(moveFolderResponseDtoSchema)
  .errors({ NOT_FOUND: {}, BAD_REQUEST: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const [folder] = await db
      .select()
      .from(noteFolders)
      .where(and(eq(noteFolders.id, input.id), eq(noteFolders.userId, userId)))
      .limit(1);

    if (!folder || folder.archivedAt) {
      throw errors.NOT_FOUND({
        message: "Folder not found.",
        data: { id: input.id },
      });
    }

    if (input.parentId) {
      const [parent] = await db
        .select({ id: noteFolders.id })
        .from(noteFolders)
        .where(
          and(
            eq(noteFolders.id, input.parentId),
            eq(noteFolders.userId, userId),
            isNull(noteFolders.archivedAt)
          )
        )
        .limit(1);

      if (!parent) {
        throw errors.NOT_FOUND({
          message: "Folder not found.",
          data: { id: input.parentId },
        });
      }

      const folders = await db
        .select({ id: noteFolders.id, parentId: noteFolders.parentId })
        .from(noteFolders)
        .where(eq(noteFolders.userId, userId));
      const subtreeIds = new Set<string>([input.id]);
      let changed = true;

      while (changed) {
        changed = false;

        for (const child of folders) {
          if (
            child.parentId &&
            subtreeIds.has(child.parentId) &&
            !subtreeIds.has(child.id)
          ) {
            subtreeIds.add(child.id);
            changed = true;
          }
        }
      }

      if (subtreeIds.has(input.parentId)) {
        throw errors.BAD_REQUEST({
          message: "Folder cannot be moved into itself or its descendants.",
        });
      }
    }

    const [moved] = await db
      .update(noteFolders)
      .set({ parentId: input.parentId ?? null, updatedAt: new Date() })
      .where(and(eq(noteFolders.id, input.id), eq(noteFolders.userId, userId)))
      .returning();

    if (!moved) {
      throw errors.NOT_FOUND({
        message: "Folder not found.",
        data: { id: input.id },
      });
    }

    return moveFolderResponseDtoSchema.parse(moved);
  });
