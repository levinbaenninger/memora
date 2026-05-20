import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../auth";

export const recentVisitEntityTypes = ["note", "folder", "tag"] as const;
export type RecentVisitEntityType = (typeof recentVisitEntityTypes)[number];

export const recentVisits = pgTable(
  "recent_visits",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    entityType: text("entity_type", { enum: recentVisitEntityTypes }).notNull(),
    entityId: text("entity_id").notNull(),
    visitedAt: timestamp("visited_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.entityType, table.entityId],
    }),
    index("recent_visits_user_visited_idx").on(
      table.userId,
      table.visitedAt.desc()
    ),
  ]
);
