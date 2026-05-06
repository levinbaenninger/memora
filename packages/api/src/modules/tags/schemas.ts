import { z } from "zod";

export const tagSchema = z.object({
  createdAt: z.date().optional(),
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  updatedAt: z.date().optional(),
});
