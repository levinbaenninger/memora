import type { db } from "@memora/db";
import { taskTags } from "@memora/db/schema";

import { isUniqueViolation } from "../../../lib/db-errors";

const TASK_TAG_NAME_UNIQUE_CONSTRAINT = "task_tags_user_name_unique";

export async function insertTaskTags(
  tx: Pick<typeof db, "insert">,
  userId: string,
  tagRows: { name: string }[]
) {
  for (const tag of tagRows) {
    try {
      await tx.insert(taskTags).values({ ...tag, userId });
    } catch (error) {
      if (!isUniqueViolation(error, TASK_TAG_NAME_UNIQUE_CONSTRAINT)) {
        throw error;
      }
    }
  }
}
