import { z } from "zod";

export const tagNameAlphanumericPattern = /^[\p{L}\p{N}]+(?: [\p{L}\p{N}]+)*$/u;

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
