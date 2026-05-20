import { and, desc, eq, lt, sql } from "drizzle-orm";

import { db } from "@memora/db";
import { recentVisits } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { recordVisitRequestDtoSchema } from "../schemas";

const MAX_ROWS_PER_USER = 50;

export const recordVisit = authorized
  .input(recordVisitRequestDtoSchema)
  .handler(async ({ context, input }) => {
    const userId = context.user.id;

    await db
      .insert(recentVisits)
      .values({
        userId,
        entityType: input.entityType,
        entityId: input.entityId,
      })
      .onConflictDoUpdate({
        target: [
          recentVisits.userId,
          recentVisits.entityType,
          recentVisits.entityId,
        ],
        set: { visitedAt: sql`now()` },
      });

    const cutoffRows = await db
      .select({ visitedAt: recentVisits.visitedAt })
      .from(recentVisits)
      .where(eq(recentVisits.userId, userId))
      .orderBy(desc(recentVisits.visitedAt))
      .limit(MAX_ROWS_PER_USER + 1);

    if (cutoffRows.length > MAX_ROWS_PER_USER) {
      const cutoff = cutoffRows[MAX_ROWS_PER_USER]?.visitedAt;
      if (cutoff) {
        await db
          .delete(recentVisits)
          .where(
            and(
              eq(recentVisits.userId, userId),
              lt(recentVisits.visitedAt, cutoff)
            )
          );
      }
    }

    return { ok: true } as const;
  });
