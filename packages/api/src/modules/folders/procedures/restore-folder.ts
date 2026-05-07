import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";

export const restoreFolderRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const restoreFolderResponseDtoSchema = z.object({
  id: z.string(),
  restoredFolderIds: z.array(z.string()),
});

export const restoreFolder = authorized
  .input(restoreFolderRequestDtoSchema)
  .output(restoreFolderResponseDtoSchema)
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

    if (folder.parentId) {
      const [parent] = await db
        .select({ id: noteFolders.id })
        .from(noteFolders)
        .where(
          and(
            eq(noteFolders.id, folder.parentId),
            eq(noteFolders.userId, userId),
            isNull(noteFolders.archivedAt)
          )
        )
        .limit(1);

      if (!parent) {
        throw errors.NOT_FOUND({
          message: "Folder not found.",
          data: { id: folder.parentId },
        });
      }
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

    const restoredFolderIds = [...subtreeIds];
    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(noteFolders)
        .set({
          archivedAt: null,
          archiveExpiresAt: null,
          archiveOriginId: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(noteFolders.userId, userId),
            eq(noteFolders.archiveOriginId, input.id),
            inArray(noteFolders.id, restoredFolderIds)
          )
        )
        .returning({ id: noteFolders.id });

      await tx
        .update(notes)
        .set({
          archivedAt: null,
          archiveExpiresAt: null,
          archiveOriginId: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(notes.userId, userId),
            eq(notes.archiveOriginId, input.id),
            inArray(notes.folderId, restoredFolderIds)
          )
        )
        .returning({ id: notes.id });
    });

    return restoreFolderResponseDtoSchema.parse({
      id: input.id,
      restoredFolderIds,
    });
  });
