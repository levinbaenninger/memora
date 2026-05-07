import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

import { user } from "../auth";
import { notes } from "./notes";

export const noteTags = pgTable(
  "note_tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("note_tags_user_slug_unique").on(table.userId, table.slug),
    index("note_tags_user_name_idx").on(table.userId, table.name),
  ]
);

export const notesToTags = pgTable(
  "notes_to_tags",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => noteTags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.tagId] }),
    index("notes_to_tags_tag_id_idx").on(table.tagId),
  ]
);
