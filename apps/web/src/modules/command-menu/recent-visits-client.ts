import { client } from "@/utils/orpc";

const DEDUPE_MS = 30_000;
const MAX_DEDUPE_ENTRIES = 500;
const lastFiredByKey = new Map<string, number>();

type EntityType = "note" | "folder" | "tag";

export function recordVisit(entityType: EntityType, entityId: string) {
  const key = `${entityType}:${entityId}`;
  const now = Date.now();
  const last = lastFiredByKey.get(key) ?? 0;
  if (now - last < DEDUPE_MS) {
    return;
  }
  // Re-insertion moves the key to the end of Map iteration order; combined
  // with the prune below this gives us a simple LRU bound.
  lastFiredByKey.delete(key);
  if (lastFiredByKey.size >= MAX_DEDUPE_ENTRIES) {
    const oldest = lastFiredByKey.keys().next().value;
    if (oldest !== undefined) {
      lastFiredByKey.delete(oldest);
    }
  }
  lastFiredByKey.set(key, now);

  client.recentVisits.record({ entityType, entityId }).catch(() => {
    lastFiredByKey.delete(key);
  });
}
