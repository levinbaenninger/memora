import type { SQL } from "drizzle-orm";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders } from "@memora/db/schema";

import { authorized } from "@/procedures/authorized";
import { folderSchema } from "../schemas";

export const listFoldersRequestDtoSchema = z.object({
  includeArchived: z.boolean().default(false),
});

export const listFoldersResponseDtoSchema = z.array(folderSchema);

export const listFolders = authorized
  .input(listFoldersRequestDtoSchema)
  .output(listFoldersResponseDtoSchema)
  .handler(async ({ context, input }) => {
    const where: SQL[] = [eq(noteFolders.userId, context.user.id)];

    if (!input.includeArchived) {
      where.push(isNull(noteFolders.archivedAt));
    }

    const folders = await db
      .select()
      .from(noteFolders)
      .where(and(...where))
      .orderBy(noteFolders.name);

    return listFoldersResponseDtoSchema.parse(folders);
  });
