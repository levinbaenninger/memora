import { z } from "zod";

export const folderSchema = z.object({
  id: z.string(),
  name: z.string(),
  archivedAt: z.date().nullable(),
  archiveExpiresAt: z.date().nullable(),
  userId: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
