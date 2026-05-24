# Share Links: capability URLs, read-only, many per Note

Owners share a Note by minting a Share Link — a capability URL `/share/$token` that any unauthenticated Visitor can open to view a read-only Public Detail. Tokens live in a dedicated `note_shares(id, noteId, token, createdAt, expiresAt?)` table, are unique 32-char nanoids, and are revoked by hard-deleting the row. A Note may have many Share Links so the owner can revoke a single leaked link without breaking the others.

## Considered options

- **User-based sharing** — owner picks a Memora user by email; recipient sees the Note in an "Incoming" section of their workspace. More flexible (audit, per-recipient revoke) but needs a recipient-side inbox UX, identity flow for invitees without an account, and a share-acceptance state machine. Rejected for scope; the project requirement is "shareable Notes", and capability URLs cover the demo cleanly. Revisit if collaboration becomes a goal.
- **One token per Note** — simpler popover UI, but rotating to revoke a leak forces all current recipients to re-fetch a new URL. Rejected: cheap to support many rows, owner gets per-link revoke for free.
- **Soft revoke (`revokedAt`)** — keeps history for audit. Rejected: no audit requirement; hard delete is simpler and removes the row from indexes.
- **Public Detail inside the app shell** (sidebar, ⌘K) — consistent visual, but every nav target 404s for a Visitor and the sidebar leaks the existence of other Notes. Rejected: Public Detail is a stripped layout with logo + "Shared by {owner}" + title + body + `updatedAt` only.

## Consequences

- New table + migration: `note_shares(id pk, note_id fk → notes on delete cascade, token text unique, created_at, expires_at nullable)`.
- New public RPC `GET /api/public/shares/$token` — no auth, no session. Returns `{ title, content, ownerName, updatedAt }` or 404. Expired and unknown tokens both return 404 (no distinction — avoids leaking which tokens once existed).
- New SPA route `/share/$token` outside the authed router tree. Inherits ADR-0002 (no SSR); Visitor sees a skeleton, then the rendered note.
- Archived Notes resolve to 404 on the public route — restoring the Note reactivates all its Share Links. Avoids the "deleted but still public" surprise without forcing the owner to also revoke links on archive.
- Owner UX: a Share button in the Detail toolbar and a "Share Note" Context Action in the Command Menu both open the same popover. The popover lists active Share Links (created date, expiry pill, Copy, Revoke) and has a "Create link" control with an optional expiry preset (none / 1d / 7d / 30d).
- Grid-level sharing (from a card) is deferred — Detail-only for v1.

## Security

Security is a first-class concern for this project; the threat model below is part of the design contract, not a follow-up:

- **Token entropy**: 32-char nanoid (~190 bits) — bruteforce infeasible. Lookup is an indexed unique-column query, not an app-level compare, so timing attacks on lookup are not a concern.
- **Rate limits**:
  - Public read endpoint `/api/public/shares/$token`: 60 req/min per IP.
  - Owner mutations (create / revoke): 30 link creates per hour per user.
  - Per-Note cap: at most 50 active Share Links.
- **Ownership**: every mint and revoke asserts `share.note.userId === session.userId` server-side. Never trust client-supplied `noteId` alone.
- **Headers on Public Detail and the public RPC**:
  - `Referrer-Policy: no-referrer` — prevents the token leaking to outbound links inside the Note.
  - `X-Robots-Tag: noindex, nofollow` and a `<meta name="robots" content="noindex,nofollow">` tag — keeps Share Links out of search engines.
- **Content safety**: Public Detail renders BlockNote's structured JSON via the same read-only renderer the editor uses — no `dangerouslySetInnerHTML`, no raw HTML passthrough.
- **CSRF**: revoke / create are authenticated mutations under the existing Better Auth session + same-origin policy. The public read endpoint is GET-only and has no side effects.
- **Logging**: scrub `$token` from server request logs and any error-reporting breadcrumbs — log a hash or the share row id instead. The token itself must never appear in observability output.
- **Indistinguishable failures**: expired, revoked, never-existed, and archived-owner all return 404 with the same body. No oracle for "did this token ever exist".
- **Residual risks (documented, not mitigated)**: tokens land in browser history and may appear in some server access logs at the load-balancer tier; the only owner-side mitigation is setting an expiry.
