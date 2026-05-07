import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { folderSchema } from "../schemas";

export const moveFolderResponseDtoSchema = folderSchema;

export const moveFolderRequestDtoSchema = z.object({
  id: z.nanoid(),
  parentId: z.nanoid().nullish(),
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

    const [moved] = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);

      if (input.parentId) {
        const [parent] = await tx
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
        const subtreeIds = new Set(subtreeRows.rows.map((row) => row.id));

        if (subtreeIds.has(input.parentId)) {
          throw errors.BAD_REQUEST({
            message: "Folder cannot be moved into itself or its descendants.",
          });
        }
      }

      return tx
        .update(noteFolders)
        .set({ parentId: input.parentId ?? null, updatedAt: new Date() })
        .where(
          and(
            eq(noteFolders.id, input.id),
            eq(noteFolders.userId, userId),
            isNull(noteFolders.archivedAt)
          )
        )
        .returning();
    });

    if (!moved) {
      throw errors.NOT_FOUND({
        message: "Folder not found.",
        data: { id: input.id },
      });
    }

    return moveFolderResponseDtoSchema.parse(moved);
  });
