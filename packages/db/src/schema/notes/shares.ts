import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

import { notes } from "./notes";

export const noteShares = pgTable(
  "note_shares",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    token: text("token")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid(32)),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("note_shares_note_id_idx").on(table.noteId),
    index("note_shares_expires_at_idx")
      .on(table.expiresAt)
      .where(sql`${table.expiresAt} IS NOT NULL`),
  ]
);
