import { and, eq, inArray, isNull, sql } from "drizzle-orm";
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

    const now = new Date();
    let restoredFolderIds: string[] = [];

    await db.transaction(async (tx) => {
      const subtreeRows = await tx.execute<{ id: string }>(sql`
        WITH RECURSIVE folder_subtree(id) AS (
          SELECT id
          FROM note_folders
          WHERE id = ${input.id} AND user_id = ${userId}
          UNION ALL
          SELECT child.id
          FROM note_folders child
          INNER JOIN folder_subtree parent ON child.parent_id = parent.id
          WHERE child.user_id = ${userId}
        )
        SELECT id FROM folder_subtree
      `);
      restoredFolderIds = subtreeRows.rows.map((row) => row.id);

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
