import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
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
    parentId: text("parent_id").references((): AnyPgColumn => noteFolders.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    archivedAt: timestamp("archived_at"),
    archiveExpiresAt: timestamp("archive_expires_at"),
    archiveOriginId: text("archive_origin_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
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
