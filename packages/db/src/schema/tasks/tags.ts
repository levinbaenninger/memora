import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export { and, eq } from "drizzle-orm";

import { nanoid } from "nanoid";

import { user } from "../auth";
import { tasks } from "./tasks";

export const taskTags = pgTable(
  "task_tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("task_tags_user_name_unique").on(table.userId, table.name),
  ]
);

export const tasksToTags = pgTable(
  "tasks_to_tags",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => taskTags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.tagId] }),
    index("tasks_to_tags_tag_id_idx").on(table.tagId),
  ]
);
