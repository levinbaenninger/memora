import { z } from "zod";

import { noteContentSchema } from "./content/schema";

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: noteContentSchema,
  favorite: z.boolean(),
  pinned: z.boolean(),
  folderId: z.string().nullable(),
  userId: z.string(),
  archivedAt: z.date().nullable(),
  archiveExpiresAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
