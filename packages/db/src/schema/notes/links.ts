import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "../auth";
import { notes } from "./notes";

export const noteLinks = pgTable(
  "note_links",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sourceNoteId: text("source_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    targetNoteId: text("target_note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.sourceNoteId, table.targetNoteId],
    }),
    uniqueIndex("note_links_user_source_target_unique").on(
      table.userId,
      table.sourceNoteId,
      table.targetNoteId
    ),
    index("note_links_user_target_idx").on(table.userId, table.targetNoteId),
    index("note_links_user_source_idx").on(table.userId, table.sourceNoteId),
  ]
);
