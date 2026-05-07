import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.int().min(1).max(100).default(50),
  offset: z.int().min(0).default(0),
});
