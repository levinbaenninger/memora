import type { SQL } from "drizzle-orm";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { tasks, tasksToTags, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { paginationSchema } from "../../shared/pagination";
import { tagSchema } from "../../task-tags/schemas";
import { taskSchema } from "../schema";

export const searchTasksRequestDtoSchema = paginationSchema.extend({
  query: z.string().trim().min(1).max(200),
});

export const searchTasksResponseDtoSchema = z.array(
  taskSchema.omit({ tags: true }).extend({
    tags: z.array(tagSchema.pick({ id: true, name: true })),
  })
);

function escapeIlike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export const searchTasks = authorized
  .input(searchTasksRequestDtoSchema)
  .output(searchTasksResponseDtoSchema)
  .handler(async ({ context, input }) => {
    const userId = context.user.id;
    const escapedQuery = escapeIlike(input.query);

    const searchWhere = or(
      sql`to_tsvector('simple', coalesce(${tasks.title}, '') || ' ' || coalesce(${tasks.description}, '')) @@ plainto_tsquery('simple', ${input.query})`,
      ilike(tasks.title, `%${escapedQuery}%`),
      ilike(tasks.description, `%${escapedQuery}%`)
    );

    const where: SQL[] = [eq(tasks.userId, userId), searchWhere as SQL];

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
      .orderBy(
        desc(
          sql`ts_rank(to_tsvector('simple', coalesce(${tasks.title}, '') || ' ' || coalesce(${tasks.description}, '')), plainto_tsquery('simple', ${input.query}))`
        ),
        desc(tasks.updatedAt)
      )
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

    return searchTasksResponseDtoSchema.parse(
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
