import { and, desc, eq, sql } from "drizzle-orm";

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

    const orderedRows = await db
      .select({
        entityType: recentVisits.entityType,
        entityId: recentVisits.entityId,
      })
      .from(recentVisits)
      .where(eq(recentVisits.userId, userId))
      .orderBy(
        desc(recentVisits.visitedAt),
        recentVisits.entityType,
        recentVisits.entityId
      )
      .limit(MAX_ROWS_PER_USER + 1);

    if (orderedRows.length > MAX_ROWS_PER_USER) {
      const keepRows = orderedRows.slice(0, MAX_ROWS_PER_USER);
      const keepTuples = sql.join(
        keepRows.map(
          (row) => sql`(${row.entityType}::text, ${row.entityId}::text)`
        ),
        sql`, `
      );
      await db
        .delete(recentVisits)
        .where(
          and(
            eq(recentVisits.userId, userId),
            sql`(${recentVisits.entityType}, ${recentVisits.entityId}) NOT IN (${keepTuples})`
          )
        );
    }

    return { ok: true } as const;
  });
