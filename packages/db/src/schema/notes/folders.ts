import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

import { user } from "../auth";

export const noteFolders = pgTable(
  "note_folders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    name: text("name").notNull(),
    archivedAt: timestamp("archived_at"),
    archiveExpiresAt: timestamp("archive_expires_at"),
    archiveOriginId: text("archive_origin_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("note_folders_user_id_unique").on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.parentId],
      foreignColumns: [table.userId, table.id],
    }).onDelete("cascade"),
    index("note_folders_user_archived_updated_idx").on(
      table.userId,
      table.archivedAt,
      table.updatedAt
    ),
    index("note_folders_user_parent_archived_idx").on(
      table.userId,
      table.parentId,
      table.archivedAt
    ),
  ]
);
