import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { noteFolders, notes } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { getSubtreeFolderIds } from "../../folders/subtree";

export const purgeExpiredArchivedResponseDtoSchema = z.object({
  deletedFolderIds: z.array(z.string()),
  deletedNoteIds: z.array(z.string()),
});

export const purgeExpiredArchived = authorized
  .output(purgeExpiredArchivedResponseDtoSchema)
  .handler(async ({ context }) => {
    const userId = context.user.id;
    const now = new Date();
    const { deletedFolderNotes, deletedFolders, deletedNotes } =
      await db.transaction(async (tx) => {
        const expiredFolders = await tx
          .select({ id: noteFolders.id })
          .from(noteFolders)
          .where(
            and(
              eq(noteFolders.userId, userId),
              isNotNull(noteFolders.archivedAt),
              sql`${noteFolders.archiveExpiresAt} <= ${now}`
            )
          );
        const expiredFolderIds = expiredFolders.map((folder) => folder.id);
        const folders = await tx
          .select({ id: noteFolders.id, parentId: noteFolders.parentId })
          .from(noteFolders)
          .where(eq(noteFolders.userId, userId));
        const folderIds = [
          ...new Set(
            expiredFolderIds.flatMap((folderId) =>
              getSubtreeFolderIds(folderId, folders)
            )
          ),
        ];
        const deletedFolderNotes =
          folderIds.length > 0
            ? await tx
                .delete(notes)
                .where(
                  and(
                    eq(notes.userId, userId),
                    isNotNull(notes.archivedAt),
                    inArray(notes.folderId, folderIds)
                  )
                )
                .returning({ id: notes.id })
            : [];
        const deletedNotes = await tx
          .delete(notes)
          .where(
            and(
              eq(notes.userId, userId),
              isNotNull(notes.archivedAt),
              sql`${notes.archiveExpiresAt} <= ${now}`
            )
          )
          .returning({ id: notes.id });
        const deletedFolders = await tx
          .delete(noteFolders)
          .where(
            and(
              eq(noteFolders.userId, userId),
              isNotNull(noteFolders.archivedAt),
              sql`${noteFolders.archiveExpiresAt} <= ${now}`
            )
          )
          .returning({ id: noteFolders.id });

        return { deletedFolderNotes, deletedFolders, deletedNotes };
      });

    return purgeExpiredArchivedResponseDtoSchema.parse({
      deletedNoteIds: [
        ...new Set([
          ...deletedFolderNotes.map((note) => note.id),
          ...deletedNotes.map((note) => note.id),
        ]),
      ],
      deletedFolderIds: deletedFolders.map((folder) => folder.id),
    });
  });
