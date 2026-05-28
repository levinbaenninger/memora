import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { tasks, tasksToTags, taskTags } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { tagNameAlphanumericPattern, tagSchema } from "../../task-tags/schemas";
import { taskSchema } from "../schema";

export const createTaskRequestDtoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(""),
  dueAt: z.date().optional(),
  tagNames: z.array(z.string().trim().min(1).max(60)).max(25).default([]),
});

export const createTaskResponseDtoSchema = taskSchema.extend({
  tags: z.array(tagSchema.pick({ id: true, name: true })),
});

export const createTask = authorized
  .input(createTaskRequestDtoSchema)
  .output(createTaskResponseDtoSchema)
  .errors({
    BAD_REQUEST: {},
    INTERNAL_SERVER_ERROR: {},
  })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const title = input.title.trim();

    if (!title) {
      throw errors.BAD_REQUEST({
        message: "Title shouldn't be empty.",
      });
    }

    const tagRows: { name: string }[] = [];
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

    let createdTask: typeof tasks.$inferSelect | undefined;

    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(tasks)
        .values({
          userId,
          title,
          description: input.description || null,
          dueAt: input.dueAt ?? null,
        })
        .returning();

      if (!created) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Internal server error.",
        });
      }

      createdTask = created;

      if (tagRows.length > 0) {
        await tx
          .insert(taskTags)
          .values(tagRows.map((tag) => ({ ...tag, userId })))
          .onConflictDoUpdate({
            target: [taskTags.userId, taskTags.name],
            set: { updatedAt: new Date() },
          });
      }

      const tags =
        tagRows.length > 0
          ? await tx
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
              )
          : [];

      if (tags.length > 0) {
        await tx.insert(tasksToTags).values(
          tags.map((tag) => ({
            taskId: created.id,
            tagId: tag.id,
          }))
        );
      }
    });

    if (!createdTask) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Internal server error.",
      });
    }

    const tags = await db
      .select({
        id: taskTags.id,
        name: taskTags.name,
      })
      .from(tasksToTags)
      .innerJoin(taskTags, eq(taskTags.id, tasksToTags.tagId))
      .where(
        and(eq(tasksToTags.taskId, createdTask.id), eq(taskTags.userId, userId))
      );

    return createTaskResponseDtoSchema.parse({
      id: createdTask.id,
      userId: createdTask.userId,
      title: createdTask.title,
      description: createdTask.description ?? "",
      dueAt: createdTask.dueAt,
      completedAt: createdTask.completedAt,
      createdAt: createdTask.createdAt,
      updatedAt: createdTask.updatedAt,
      tags,
    });
  });
