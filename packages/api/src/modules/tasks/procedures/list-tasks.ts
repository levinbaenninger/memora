import type { SQL } from "drizzle-orm";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { tasks, tasksToTags, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { paginationSchema } from "../../shared/pagination";
import { tagSchema } from "../../task-tags/schemas";
import { taskSchema } from "../schema";

export const listTasksRequestDtoSchema = paginationSchema.extend({
  completed: z.boolean().optional(),
  tagId: z.nanoid().optional(),
});

export const listTasksResponseDtoSchema = z.array(
  taskSchema.extend({
    tags: z.array(tagSchema.pick({ id: true, name: true })),
  })
);

export const listTasks = authorized
  .input(listTasksRequestDtoSchema)
  .output(listTasksResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    if (input.tagId) {
      const [tag] = await db
        .select({ id: taskTags.id })
        .from(taskTags)
        .where(and(eq(taskTags.id, input.tagId), eq(taskTags.userId, userId)))
        .limit(1);

      if (!tag) {
        throw errors.NOT_FOUND({
          message: "Tag not found.",
          data: { id: input.tagId },
        });
      }
    }

    const where: SQL[] = [eq(tasks.userId, userId)];

    if (input.completed === true) {
      where.push(isNotNull(tasks.completedAt));
    } else if (input.completed === false) {
      where.push(isNull(tasks.completedAt));
    }

    if (input.tagId) {
      const taggedTasks = await db
        .select({ taskId: tasksToTags.taskId })
        .from(tasksToTags)
        .where(eq(tasksToTags.tagId, input.tagId));

      const taggedTaskIds = taggedTasks.map((link) => link.taskId);

      if (taggedTaskIds.length === 0) {
        return listTasksResponseDtoSchema.parse([]);
      }

      where.push(inArray(tasks.id, taggedTaskIds));
    }

    const foundTasks = await db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueAt: tasks.dueAt,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(and(...where))
      .orderBy(desc(tasks.updatedAt))
      .limit(input.limit)
      .offset(input.offset);

    const taskIds = foundTasks.map((task) => task.id);
    const tagLinks =
      taskIds.length > 0
        ? await db
            .select({
              taskId: tasksToTags.taskId,
              id: taskTags.id,
              name: taskTags.name,
            })
            .from(tasksToTags)
            .innerJoin(taskTags, eq(taskTags.id, tasksToTags.tagId))
            .where(
              and(
                inArray(tasksToTags.taskId, taskIds),
                eq(taskTags.userId, userId)
              )
            )
        : [];

    const tagsByTaskId = new Map<string, { id: string; name: string }[]>();

    for (const tagLink of tagLinks) {
      const tags = tagsByTaskId.get(tagLink.taskId) ?? [];
      tags.push({ id: tagLink.id, name: tagLink.name });
      tagsByTaskId.set(tagLink.taskId, tags);
    }

    return listTasksResponseDtoSchema.parse(
      foundTasks.map((task) => ({
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description ?? "",
        dueAt: task.dueAt,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        tags: tagsByTaskId.get(task.id) ?? [],
      }))
    );
  });
