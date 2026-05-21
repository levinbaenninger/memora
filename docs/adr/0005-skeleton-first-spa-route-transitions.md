# SPA route transitions: skeleton-first with cache-warmed preload

Memora ships as an SPA (no SSR — see ADR 0002). Client-side route navigation therefore always starts a fresh network round-trip on cold cache. To make this feel snappy and unambiguous, we adopt a single, app-wide policy: every route paints a shape-matched skeleton immediately on a cache miss, and the hover-driven preload warms the cache so that the *common* case is an instant transition with no skeleton at all.

## Policy

- **Router defaults** (`apps/web/src/router.tsx`):
  - `defaultPreload: "intent"` — hover/focus warms cache before click.
  - `defaultPreloadStaleTime: 30_000` — preloaded data survives the click.
  - `defaultPendingMs: 0` — pending UI shows immediately on miss.
  - `defaultPendingMinMs: 150` — once shown, sticks long enough to avoid flash.
  - `defaultPendingComponent: RouteSkeleton` — generic fallback for routes without a shape.
- **QueryClient defaults**: `staleTime: 30_000` so background invalidations don't force a spinner on the next nav; data is returned stale-while-revalidate.
- **Per-route `pendingComponent`** on every data-bearing route (`/notes/*`, `/dashboard`) renders a layout-stable skeleton (real header where known, placeholder cards in the grid).
- **Shared query-input builders** (`notesListInput`, `notesSearchInput` in `modules/notes/queries.ts`) guarantee loader prefetch and component query use the same cache key — otherwise the loader warms one key and the hook subscribes to a different one, defeating the preload entirely.
- **Suspense boundary on the sidebar tree** (`NotesNavPanel`) decouples folder/tag loads from main content: a slow tree shows its own skeleton instead of suspending the whole app.

## Why

- The previous defaults (`defaultPreloadStaleTime: 0`, no `pendingComponent`, default `pendingMs: 1000`) produced a confusing UX: URL flipped instantly, but the *previous* route stayed mounted for up to a second while the next loader ran, so users saw "All Notes" data under a "Pinned" URL.
- A shape-matched skeleton on every miss makes the transition unambiguous: the new View is clearly loading, and layout doesn't jump when real data arrives.
- Aligning loader input with hook input was load-bearing: cache-key drift was silently turning every nav into a cold fetch despite the loader.

## Considered options

- **Keep previous-page visible (`placeholderData: keepPreviousData`).** Rejected: under ADR 0003 Views are mutually exclusive, so showing one View's data while the URL claims another View is a category error. Skeleton-first matches the URL→state 1:1 invariant.
- **Pure Suspense + `useSuspenseQuery` everywhere, drop loaders.** Rejected: loaders give us hover preload "for free" via the router. Combining loader prefetch with a `pendingComponent` keeps preloads working and avoids manual `<Suspense>` plumbing per route.
- **Surgical per-view query invalidation in mutations.** Rejected as unnecessary: with `staleTime: 30_000`, a broad invalidate marks stale but keeps cached data on screen until the background refetch lands.

## Consequences

- Adding new data-bearing routes requires three matching pieces: a shared `notesListInput`-style key builder, a loader using it, and a `pendingComponent` skeleton. Anything missed degrades to the generic `RouteSkeleton`.
- The shared input builders become the single source of truth for query keys. Changing the shape of a query (e.g., adding a default filter) must go through the builder; ad-hoc inputs at call sites will silently miscache.
- Mutations invalidate broadly (`orpc.notes.list.key()`) and rely on staleTime + stale-while-revalidate for UX. If we ever need *fresh-only* reads (e.g., post-payment state), opt out per query rather than narrowing the invalidate.
