import { z } from "zod";

import { recentVisitEntityTypes } from "@memora/db/schema";

export const recentVisitEntityTypeSchema = z.enum(recentVisitEntityTypes);

export const recordVisitRequestDtoSchema = z.object({
  entityType: recentVisitEntityTypeSchema,
  entityId: z.nanoid(),
});

export const recentEntitySchema = z.object({
  entityType: recentVisitEntityTypeSchema,
  id: z.string(),
  title: z.string(),
  slug: z.string().nullable(),
  folderName: z.string().nullable(),
  visitedAt: z.date(),
});

export const listRecentsResponseDtoSchema = z.array(recentEntitySchema);
