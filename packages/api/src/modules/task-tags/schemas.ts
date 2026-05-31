import { z } from "zod";

export { tagNameAlphanumericPattern } from "./constants";

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
