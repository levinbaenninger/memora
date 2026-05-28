import { z } from "zod";

import { tagSchema } from "../task-tags/schemas";

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
  userId: z.string(),
  tags: z.array(tagSchema),
});
