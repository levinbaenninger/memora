import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@memora/db";
import { noteFolders, notes, noteTags, recentVisits } from "@memora/db/schema";

import { authorized } from "../../../procedures/authorized";
import { recordVisitRequestDtoSchema } from "../schemas";

const MAX_ROWS_PER_USER = 50;

export const recordVisit = authorized
  .input(recordVisitRequestDtoSchema)
  .errors({ NOT_FOUND: {} })
  .handler(async ({ context, input, errors }) => {
    const userId = context.user.id;
    const exists = await entityExistsForUser({
      entityId: input.entityId,
      entityType: input.entityType,
      userId,
    });

    if (!exists) {
      throw errors.NOT_FOUND({
        message: "Recent visit target not found.",
        data: { id: input.entityId },
      });
    }

    await db.transaction(async (tx) => {
      // Serialize concurrent trims for the same user so the upsert and
      // delete observe a consistent ordering.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(
        hashtextextended(${`recent_visits:${userId}`}, 0)
      )`);

      await tx
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

      const orderedRows = await tx
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
        await tx
          .delete(recentVisits)
          .where(
            and(
              eq(recentVisits.userId, userId),
              sql`(${recentVisits.entityType}, ${recentVisits.entityId}) NOT IN (${keepTuples})`
            )
          );
      }
    });

    return { ok: true } as const;
  });

async function entityExistsForUser({
  entityId,
  entityType,
  userId,
}: {
  entityId: string;
  entityType: "folder" | "note" | "tag";
  userId: string;
}) {
  if (entityType === "note") {
    const [note] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(
        and(
          eq(notes.id, entityId),
          eq(notes.userId, userId),
          isNull(notes.archivedAt)
        )
      )
      .limit(1);

    return Boolean(note);
  }

  if (entityType === "folder") {
    const [folder] = await db
      .select({ id: noteFolders.id })
      .from(noteFolders)
      .where(
        and(
          eq(noteFolders.id, entityId),
          eq(noteFolders.userId, userId),
          isNull(noteFolders.archivedAt)
        )
      )
      .limit(1);

    return Boolean(folder);
  }

  const [tag] = await db
    .select({ id: noteTags.id })
    .from(noteTags)
    .where(and(eq(noteTags.id, entityId), eq(noteTags.userId, userId)))
    .limit(1);

  return Boolean(tag);
}
