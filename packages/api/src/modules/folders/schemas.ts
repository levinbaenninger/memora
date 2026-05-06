import { z } from "zod";

export const folderSchema = z.object({
  archivedAt: z.date().nullable(),
  archiveExpiresAt: z.date().nullable(),
  createdAt: z.date(),
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  updatedAt: z.date(),
  userId: z.string(),
});
