import type { db } from "@memora/db";
import { taskTags } from "@memora/db/schema";

export async function insertTaskTags(
  tx: Pick<typeof db, "insert">,
  userId: string,
  tagRows: { name: string }[]
) {
  if (tagRows.length === 0) {
    return;
  }
  await tx
    .insert(taskTags)
    .values(tagRows.map((tag) => ({ ...tag, userId })))
    .onConflictDoNothing();
}
