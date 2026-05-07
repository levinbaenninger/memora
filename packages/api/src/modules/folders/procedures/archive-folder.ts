import { and, eq, inArray, isNull } from "drizzle-orm";
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

    const archivedFolderIds = [...subtreeIds];
    const now = new Date();
    const archiveExpiresAt = new Date(
      now.getTime() + ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );

    await db.transaction(async (tx) => {
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
            inArray(notes.folderId, archivedFolderIds)
          )
        )
        .returning({ id: notes.id });

      await tx
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
            inArray(noteFolders.id, archivedFolderIds)
          )
        )
        .returning({ id: noteFolders.id });
    });

    return archiveFolderResponseDtoSchema.parse({
      id: input.id,
      archivedAt: now,
      archiveExpiresAt,
      archivedFolderIds,
    });
  });
