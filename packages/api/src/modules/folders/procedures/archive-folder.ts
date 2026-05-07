import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { ARCHIVE_RETENTION_DAYS } from "../../notes/constants";

export const archiveFolderRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const archiveFolderResponseDtoSchema = z.object({
  archivedAt: z.date(),
  archivedFolderIds: z.array(z.string()),
  archiveExpiresAt: z.date(),
  id: z.string(),
});

export const archiveFolder = authorized
  .input(archiveFolderRequestDtoSchema)
  .output(archiveFolderResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
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

    const now = new Date();
    const archiveExpiresAt = new Date(
      now.getTime() + ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );
    let archivedFolderIds: string[] = [];

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
      const subtreeIds = subtreeRows.rows.map((row) => row.id);

      await tx
        .update(notes)
        .set({
          archivedAt: now,
          archiveExpiresAt,
          archiveOriginId: input.id,
          updatedAt: now,
        })
        .where(
          and(
            eq(notes.userId, userId),
            isNull(notes.archivedAt),
            inArray(notes.folderId, subtreeIds)
          )
        )
        .returning({ id: notes.id });

      const archivedFolders = await tx
        .update(noteFolders)
        .set({
          archivedAt: now,
          archiveExpiresAt,
          archiveOriginId: input.id,
          updatedAt: now,
        })
        .where(
          and(
            eq(noteFolders.userId, userId),
            isNull(noteFolders.archivedAt),
            inArray(noteFolders.id, subtreeIds)
          )
        )
        .returning({ id: noteFolders.id });

      archivedFolderIds = archivedFolders.map((folder) => folder.id);
    });

    return archiveFolderResponseDtoSchema.parse({
      id: input.id,
      archivedAt: now,
      archiveExpiresAt,
      archivedFolderIds,
    });
  });
