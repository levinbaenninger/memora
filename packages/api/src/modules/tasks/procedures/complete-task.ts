import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { tasks, tasksToTags, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { tagSchema } from "../../task-tags/schemas";
import { taskSchema } from "../schema";

export const completeTaskRequestDtoSchema = z.object({
  id: z.nanoid(),
  completed: z.boolean().default(true),
});

export const completeTaskResponseDtoSchema = taskSchema.extend({
  tags: z.array(tagSchema.pick({ id: true, name: true })),
});

export const completeTask = authorized
  .input(completeTaskRequestDtoSchema)
  .output(completeTaskResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const now = new Date();

    const [task] = await db
      .update(tasks)
      .set({
        completedAt: input.completed ? now : null,
        updatedAt: now,
      })
      .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)))
      .returning();

    if (!task) {
      throw errors.NOT_FOUND({
        message: "Task not found.",
        data: { id: input.id },
      });
    }

    const tags = await db
      .select({
        id: taskTags.id,
        name: taskTags.name,
      })
      .from(tasksToTags)
      .innerJoin(taskTags, eq(taskTags.id, tasksToTags.tagId))
      .where(and(eq(tasksToTags.taskId, task.id), eq(taskTags.userId, userId)));

    return completeTaskResponseDtoSchema.parse({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description ?? "",
      dueAt: task.dueAt,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      tags,
    });
  });
