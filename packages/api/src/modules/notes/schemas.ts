import { z } from "zod";

import { noteContentSchema } from "./content/schema";

export const noteSchema = z.object({
  archivedAt: z.date().nullable(),
  archiveExpiresAt: z.date().nullable().optional(),
  content: noteContentSchema,
  createdAt: z.date(),
  favorite: z.boolean(),
  folderId: z.string().nullable(),
  id: z.string(),
  pinned: z.boolean(),
  title: z.string(),
  updatedAt: z.date(),
  userId: z.string(),
});
