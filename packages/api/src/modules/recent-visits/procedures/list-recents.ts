import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@memora/db";
import { noteFolders, notes, noteTags, recentVisits } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { listRecentsResponseDtoSchema } from "../schemas";

const RESULT_LIMIT = 20;

export const listRecents = authorized
  .output(listRecentsResponseDtoSchema)
  .handler(async ({ context }) => {
    const userId = context.user.id;

    const rows = await db
      .select()
      .from(recentVisits)
      .where(eq(recentVisits.userId, userId))
      .orderBy(desc(recentVisits.visitedAt))
      .limit(RESULT_LIMIT);

    const noteIds = rows
      .filter((row) => row.entityType === "note")
      .map((row) => row.entityId);
    const folderIds = rows
      .filter((row) => row.entityType === "folder")
      .map((row) => row.entityId);
    const tagIds = rows
      .filter((row) => row.entityType === "tag")
      .map((row) => row.entityId);

    const [noteRows, folderRows, tagRows] = await Promise.all([
      noteIds.length > 0
        ? db
            .select({
              id: notes.id,
              title: notes.title,
              folderName: noteFolders.name,
            })
            .from(notes)
            .leftJoin(noteFolders, eq(notes.folderId, noteFolders.id))
            .where(
              and(
                eq(notes.userId, userId),
                isNull(notes.archivedAt),
                inArray(notes.id, noteIds)
              )
            )
        : [],
      folderIds.length > 0
        ? db
            .select({
              id: noteFolders.id,
              name: noteFolders.name,
            })
            .from(noteFolders)
            .where(
              and(
                eq(noteFolders.userId, userId),
                isNull(noteFolders.archivedAt),
                inArray(noteFolders.id, folderIds)
              )
            )
        : [],
      tagIds.length > 0
        ? db
            .select({
              id: noteTags.id,
              name: noteTags.name,
              slug: noteTags.slug,
            })
            .from(noteTags)
            .where(
              and(eq(noteTags.userId, userId), inArray(noteTags.id, tagIds))
            )
        : [],
    ]);

    const notesById = new Map(noteRows.map((row) => [row.id, row]));
    const foldersById = new Map(folderRows.map((row) => [row.id, row]));
    const tagsById = new Map(tagRows.map((row) => [row.id, row]));

    const hydrated = rows
      .map((row) => {
        if (row.entityType === "note") {
          const note = notesById.get(row.entityId);
          if (!note) {
            return null;
          }
          return {
            entityType: row.entityType,
            id: note.id,
            title: note.title || "Untitled",
            slug: null,
            folderName: note.folderName,
            visitedAt: row.visitedAt,
          };
        }
        if (row.entityType === "folder") {
          const folder = foldersById.get(row.entityId);
          if (!folder) {
            return null;
          }
          return {
            entityType: row.entityType,
            id: folder.id,
            title: folder.name,
            slug: null,
            folderName: null,
            visitedAt: row.visitedAt,
          };
        }
        const tag = tagsById.get(row.entityId);
        if (!tag) {
          return null;
        }
        return {
          entityType: row.entityType,
          id: tag.id,
          title: tag.name,
          slug: tag.slug,
          folderName: null,
          visitedAt: row.visitedAt,
        };
      })
      .filter((entry) => entry !== null);

    return listRecentsResponseDtoSchema.parse(hydrated);
  });
