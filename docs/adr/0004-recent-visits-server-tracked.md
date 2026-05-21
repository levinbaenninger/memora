# Recent Visits: server-tracked via dedicated table

The Command Menu surfaces a Recent group in its empty state. We track Recent Visits on the server in a dedicated `recent_visits(userId, entityType, entityId, visitedAt)` table — upserted on route loader entry (with a 30s client-side dedupe) and read via a hydrated `listRecents` RPC that joins notes/folders/tags by type. This costs a migration and a write per nav, but gives cross-device recency and lets the palette render Recent instantly without dependent fetches.

## Considered options

- **localStorage** — per-device list of recent IDs. Cheap, no schema, but no cross-device sync and stale references are awkward to garbage-collect. Rejected because the workspace is multi-device by intent.
- **Per-entity `lastVisitedAt` columns** on `notes`, `noteFolders`, `noteTags`. Avoids a new table but forces three queries + union + sort on every palette open, and bloats hot rows with a high-churn timestamp. Rejected.
- **JSON blob on `users.recents`** — simple but read-modify-write contention on the user row, and clumsy to query/filter by entity kind. Rejected.

## Consequences

- New table + migration. `entityType` is an enum (`note | folder | tag`); routes are not recorded.
- Visits fire from TanStack Router loaders. A client-side 30s dedupe prevents spam from refresh/tab-refocus.
- `ON DELETE CASCADE` on the entity FKs (or LEFT JOIN + NULL filter) handles hard-delete orphans.
- Per-user row cap (e.g., 50) trimmed on upsert to bound table growth.
- `listRecents` returns hydrated rows (`{type, id, title, …}`) — single round-trip on palette open.
