import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders } from "@memora/db/schema";

import { authorized } from "@/procedures/authorized";
import { folderSchema } from "../schemas";

export const updateFolderRequestDtoSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
});

export const updateFolderResponseDtoSchema = folderSchema;

export const updateFolder = authorized
  .input(updateFolderRequestDtoSchema)
  .output(updateFolderResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const [folder] = await db
      .update(noteFolders)
      .set({ name: input.name, updatedAt: new Date() })
      .where(
        and(
          eq(noteFolders.id, input.id),
          eq(noteFolders.userId, context.user.id)
        )
      )
      .returning();

    if (!folder) {
      throw errors.NOT_FOUND({
        message: "Folder not found.",
        data: { id: input.id },
      });
    }

    return updateFolderResponseDtoSchema.parse(folder);
  });
