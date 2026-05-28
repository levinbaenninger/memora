import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@memora/db";
import { tasks } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";

export const deleteTaskRequestDtoSchema = z.object({
  id: z.nanoid(),
});

export const deleteTaskResponseDtoSchema = z.object({
  id: z.string(),
});

export const deleteTask = authorized
  .input(deleteTaskRequestDtoSchema)
  .output(deleteTaskResponseDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const deleted = await db
      .delete(tasks)
      .where(and(eq(tasks.id, input.id), eq(tasks.userId, context.user.id)))
      .returning({ id: tasks.id });

    if (deleted.length === 0) {
      throw errors.NOT_FOUND({
        message: "Task not found.",
        data: { id: input.id },
      });
    }

    return deleteTaskResponseDtoSchema.parse({ id: input.id });
  });
