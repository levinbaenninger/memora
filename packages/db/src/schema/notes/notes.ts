import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../auth";
import { noteFolders } from "./folders";

export type NoteContent = Record<string, unknown>;

export const notes = pgTable(
  "notes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    folderId: text("folder_id").references(() => noteFolders.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    content: jsonb("content").$type<NoteContent>().notNull(),
    contentText: text("content_text").notNull(),
    pinned: boolean("pinned").default(false).notNull(),
    favorite: boolean("favorite").default(false).notNull(),
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
    index("notes_user_archived_updated_idx").on(
      table.userId,
      table.archivedAt,
      table.updatedAt
    ),
    index("notes_user_folder_archived_idx").on(
      table.userId,
      table.folderId,
      table.archivedAt
    ),
    index("notes_search_idx").using(
      "gin",
      sql`to_tsvector('simple', coalesce(${table.title}, '') || ' ' || coalesce(${table.contentText}, ''))`
    ),
  ]
);
