# Rate Limiting: Upstash Redis with sliding window, fail-closed

Rate limiting moves from an in-memory `Map` in `packages/api/src/middlewares/rate-limit.ts` to Upstash Redis via `@upstash/ratelimit`. The in-memory limiter under-enforces in serverless deploys: each cold instance starts with an empty bucket, so an attacker spreading requests across instances multiplies the effective limit by the active instance count. Since rate limits in this project exist for abuse prevention (Share Link creation, public read flooding, duplication), correctness — not latency shaping — is the contract, and a central store is required.

The limiter exposes one async function returning a rich result so callsites can set `X-RateLimit-*` and `Retry-After` headers and throw `ORPCError` on denial:

```ts
consumeRateLimit(identifier: string, opts: RateLimitOptions):
  Promise<{ success: boolean; limit: number; remaining: number; reset: number }>
```

A single `Ratelimit` instance per `name` is constructed lazily with `slidingWindow(limit, windowMs)`, `prefix: "memora:${NODE_ENV}:${name}"`, `ephemeralCache: new Map()`, and `analytics: true`. The Upstash client uses a 1s timeout.

## Considered options

- **Vercel KV** — same Upstash engine, unified billing if on Vercel. Rejected: locks the limiter to a Vercel-only env var contract; the deploy target is not assumed to stay on Vercel forever, and the direct Upstash SDK is portable.
- **Postgres token bucket on Neon** — atomic via `UPDATE ... RETURNING`, one fewer vendor, no new env vars. Rejected: every rate-limited request becomes a DB round-trip on the hot path, the public share read endpoint already touches the DB once, and a write-on-read for the limiter would double its DB cost. Also forces hand-rolled algorithm code that `@upstash/ratelimit` ships and battle-tests for free.
- **Cloudflare Durable Objects / Workers KV** — strong consistency, edge-local. Rejected: requires committing to the Cloudflare runtime; the app is a TanStack Start SSR-disabled SPA with a Node server today.
- **Keep the in-memory `Map` with a smaller per-instance limit** — divide configured limit by expected instance count. Rejected: the active instance count is not knowable at config time, scales unpredictably, and the math leaks runtime topology into the security contract.
- **In-memory fallback when Upstash env vars are absent** — zero-setup for contributors. Rejected: maintains two limiter implementations with subtly different semantics (fixed vs sliding window, per-instance vs central), and a contributor running locally without Upstash would silently get the broken behavior the migration is meant to fix. Forcing the env vars in all environments keeps one code path and one set of assertions to reason about.
- **Fixed window** (current algorithm) — simplest, one Redis op per request. Rejected: allows a 2× burst across the window boundary (max requests in the last ms of window N plus max requests in the first ms of window N+1). For abuse-prevention limits this is the failure mode worth closing.
- **Token bucket** — best for "steady rate plus occasional burst". Rejected: the limits here (60 reads/min, 30 writes/hour) are flat caps, not burst-shaped traffic; sliding window matches the intent more directly.
- **Fail-open on Redis errors** — preserve availability. Rejected: the entire point of the migration is to make abuse prevention enforceable, and a fail-open mode hands an attacker a known bypass (induce or wait for an Upstash blip). A 1s timeout plus `ephemeralCache` plus Upstash's stated availability keep the false-positive rate acceptable; Sentry captures every fail-closed event so a real outage surfaces immediately.

## Consequences

- **New dependency**: `@upstash/ratelimit` and `@upstash/redis` added to `packages/api`.
- **New required env vars** in `@memora/env/server`: `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Boot fails fast in any environment without them — including local dev. Contributors provision a free Upstash dev database; the README is updated with the setup step.
- **API shape change**: `consumeRateLimit` becomes async and returns `{ success, limit, remaining, reset }`. All three callsites in `packages/api/src/modules/shares/procedures/` (`create-share`, `duplicate-from-share`, `get-public-share`) await the call and, on denial, throw `ORPCError("TOO_MANY_REQUESTS", { data: { retryAfter } })` so clients see structured 429s with a retry hint.
- **Key namespacing**: keys are `memora:${NODE_ENV}:${name}:${identifier}`. Prevents dev and prod cross-talk on a shared dev database and reserves headroom for future limiters outside the shares module.
- **Identifier policy unchanged**: IP for the public share read (via `extractClientIp` reading `x-forwarded-for` then `x-real-ip`), `userId` for the authenticated write paths.
- **Ephemeral cache enabled**: once a key is over budget, the per-instance `Map` short-circuits subsequent denials until the window resets. Cuts Redis cost and latency for repeat-offender traffic without weakening enforcement.
- **Analytics enabled in production**: Upstash's per-decision analytics dashboard becomes the source of truth for tuning the configured limits and spotting abuse patterns. Each decision costs one extra Redis command; acceptable at current traffic.
- **Tests**: unit tests mock `@upstash/ratelimit` at the module boundary via `vi.mock`, so no network call in CI for unit suites. Integration tests targeting the shares procedures hit the dev Upstash database.
- **Observability**: every Redis error or timeout in the limiter is captured to Sentry with the limiter `name` as a tag. A spike in capture rate is the signal that Upstash is degraded.
- **Removed**: the `Map`-based `buckets` store and its `sweep` function. No fallback path remains — the limiter either talks to Upstash or the request fails closed.
- **Better Auth uses the same Redis** via `secondaryStorage` plus `rateLimit: { storage: "secondary-storage", enabled: true }`. Without this, Better Auth's in-memory limiter has the same cold-start bypass as the old shares limiter — and auth endpoints (`/sign-in/email`, `/sign-up/email`, `/forget-password`, `/two-factor/*`) are the highest-value abuse targets in the app. Custom rules tighten sign-in to 5/min, password reset and sign-up to 5–10/hour, 2FA verify to 5/min. `secondaryStorage` doubles as a session cache, removing a DB round-trip from session lookups.
- **Global per-user oRPC limiter** added as middleware on the `authorized` procedure: 300 req/min per `userId`. This is a defense-in-depth floor that applies to every authenticated route automatically, so a runaway client or a yet-unidentified abuse vector cannot exceed a sane request budget even on endpoints without a dedicated per-route limit. Public (unauthenticated) procedures rely on their per-route IP limits; there is no global IP-keyed limiter at the `base` layer because the only public surface today is `get-public-share`, which already enforces an IP limit.
