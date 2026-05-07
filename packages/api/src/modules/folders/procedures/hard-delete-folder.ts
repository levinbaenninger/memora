import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { getSubtreeFolderIds } from "../subtree";

export const hardDeleteFolderRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const hardDeleteFolderResponseDtoSchema = z.object({
  deletedFolderIds: z.array(z.string()),
  id: z.string(),
});

export const hardDeleteFolder = authorized
  .input(hardDeleteFolderRequestDtoSchema)
  .output(hardDeleteFolderResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const [folder] = await db
      .select()
      .from(noteFolders)
      .where(and(eq(noteFolders.id, input.id), eq(noteFolders.userId, userId)))
      .limit(1);

    if (!folder?.archivedAt) {
      throw errors.NOT_FOUND({
        message: "Archived folder not found.",
        data: { id: input.id },
      });
    }

    const folders = await db
      .select({ id: noteFolders.id, parentId: noteFolders.parentId })
      .from(noteFolders)
      .where(eq(noteFolders.userId, userId));
    const subtreeIds = getSubtreeFolderIds(input.id, folders);
    let deletedFolderIds: string[] = [];

    await db.transaction(async (tx) => {
      await tx
        .delete(notes)
        .where(
          and(
            eq(notes.userId, userId),
            isNotNull(notes.archivedAt),
            inArray(notes.folderId, subtreeIds)
          )
        )
        .returning({ id: notes.id });

      const deletedFolders = await tx
        .delete(noteFolders)
        .where(
          and(
            eq(noteFolders.userId, userId),
            isNotNull(noteFolders.archivedAt),
            inArray(noteFolders.id, subtreeIds)
          )
        )
        .returning({ id: noteFolders.id });

      deletedFolderIds = deletedFolders.map((folder) => folder.id);
    });

    return hardDeleteFolderResponseDtoSchema.parse({
      id: input.id,
      deletedFolderIds,
    });
  });
