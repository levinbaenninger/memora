import { relations } from "drizzle-orm";

import { user } from "../auth";
import { tasksToTags, taskTags } from "./tags";
import { tasks } from "./tasks";

export * from "./tags";
export * from "./tasks";

export const taskRelations = relations(tasks, ({ one, many }) => ({
  user: one(user, {
    fields: [tasks.userId],
    references: [user.id],
  }),
  tags: many(tasksToTags),
}));

export const taskTagRelations = relations(taskTags, ({ one, many }) => ({
  user: one(user, {
    fields: [taskTags.userId],
    references: [user.id],
  }),
  tasks: many(tasksToTags),
}));

export const tasksToTagsRelations = relations(tasksToTags, ({ one }) => ({
  task: one(tasks, {
    fields: [tasksToTags.taskId],
    references: [tasks.id],
  }),
  tag: one(taskTags, {
    fields: [tasksToTags.tagId],
    references: [taskTags.id],
  }),
}));
