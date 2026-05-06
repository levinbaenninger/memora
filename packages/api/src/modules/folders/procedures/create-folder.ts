import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders } from "@memora/db/schema";

import { authorized } from "@/procedures/authorized";
import { folderSchema } from "../schemas";

export const createFolderRequestDtoSchema = z.object({
  name: z.string().trim().min(1).max(120),
  parentId: z.uuid().nullish(),
});

export const createFolderResponseDtoSchema = folderSchema;

export const createFolder = authorized
  .input(createFolderRequestDtoSchema)
  .output(createFolderResponseDtoSchema)
  .errors({ NOT_FOUND: {}, INTERNAL_SERVER_ERROR: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

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
    }

    const [folder] = await db
      .insert(noteFolders)
      .values({
        id: crypto.randomUUID(),
        userId,
        parentId: input.parentId ?? null,
        name: input.name,
      })
      .returning();

    if (!folder) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Internal server error.",
      });
    }

    return createFolderResponseDtoSchema.parse(folder);
  });
