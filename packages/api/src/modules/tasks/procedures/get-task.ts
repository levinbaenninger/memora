import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { tasks, tasksToTags, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { tagSchema } from "../../task-tags/schemas";
import { taskSchema } from "../schema";

export const getTaskRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const getTaskResponseDtoSchema = taskSchema.extend({
  tags: z.array(tagSchema.pick({ id: true, name: true })),
});

export const getTask = authorized
  .input(getTaskRequestDtoSchema)
  .output(getTaskResponseDtoSchema)
  .errors({
    NOT_FOUND: {
      message: "Task not found.",
      data: z.object({
        id: getTaskRequestDtoSchema.shape.id,
      }),
    },
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)))
      .limit(1);

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

    return getTaskResponseDtoSchema.parse({
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
