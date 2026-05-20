import { client } from "@/utils/orpc";

const DEDUPE_MS = 30_000;
const lastFiredByKey = new Map<string, number>();

type EntityType = "note" | "folder" | "tag";

export function recordVisit(entityType: EntityType, entityId: string) {
  const key = `${entityType}:${entityId}`;
  const now = Date.now();
  const last = lastFiredByKey.get(key) ?? 0;
  if (now - last < DEDUPE_MS) {
    return;
  }
  lastFiredByKey.set(key, now);

  client.recentVisits.record({ entityType, entityId }).catch(() => {
    lastFiredByKey.delete(key);
  });
}
