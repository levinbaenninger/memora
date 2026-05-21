import { z } from "zod";

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
