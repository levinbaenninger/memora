import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { tasks, tasksToTags, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { tagNameAlphanumericPattern, tagSchema } from "../../task-tags/schemas";
import { taskSchema } from "../schema";

export const updateTaskRequestDtoSchema = z.object({
  id: z.nanoid(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  dueAt: z.date().nullish(),
  tagNames: z.array(z.string().trim().min(1).max(60)).max(25).optional(),
});

export const updateTaskResponseDtoSchema = taskSchema.extend({
  tags: z.array(tagSchema.pick({ id: true, name: true })),
});

export const updateTask = authorized
  .input(updateTaskRequestDtoSchema)
  .output(updateTaskResponseDtoSchema)
  .errors({ NOT_FOUND: {}, BAD_REQUEST: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;

    const [existingTask] = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)))
      .limit(1);

    if (!existingTask) {
      throw errors.NOT_FOUND({
        message: "Task not found.",
        data: { id: input.id },
      });
    }

    const tagRows: { name: string }[] = [];

    if (input.tagNames !== undefined) {
      const tagValues = new Map<string, { name: string }>();

      for (const tagName of input.tagNames) {
        const name = tagName.trim().replace(/\s+/g, " ");

        if (!tagNameAlphanumericPattern.test(name)) {
          throw errors.BAD_REQUEST({
            message: "Tag name must contain letters or numbers.",
          });
        }

        tagValues.set(name, { name });
      }

      tagRows.push(...tagValues.values());
    }

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(tasks)
        .set({
          title: input.title,
          description: input.description,
          ...(input.dueAt === undefined ? {} : { dueAt: input.dueAt }),
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)))
        .returning();

      if (!updated) {
        throw errors.NOT_FOUND({
          message: "Task not found.",
          data: { id: input.id },
        });
      }

      if (input.tagNames !== undefined) {
        if (tagRows.length > 0) {
          await tx
            .insert(taskTags)
            .values(tagRows.map((tag) => ({ ...tag, userId })))
            .onConflictDoUpdate({
              target: [taskTags.userId, taskTags.name],
              set: { updatedAt: new Date() },
            });
        }

        let tags: { id: string }[] = [];

        if (tagRows.length > 0) {
          tags = await tx
            .select({ id: taskTags.id })
            .from(taskTags)
            .where(
              and(
                eq(taskTags.userId, userId),
                inArray(
                  taskTags.name,
                  tagRows.map((tag) => tag.name)
                )
              )
            );
        }

        await tx.delete(tasksToTags).where(eq(tasksToTags.taskId, input.id));

        if (tags.length > 0) {
          await tx.insert(tasksToTags).values(
            tags.map((tag) => ({
              taskId: input.id,
              tagId: tag.id,
            }))
          );
        }
      }
    });

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

    return updateTaskResponseDtoSchema.parse({
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
