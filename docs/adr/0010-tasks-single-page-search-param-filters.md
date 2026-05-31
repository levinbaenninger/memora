# Tasks: single-page surface with search-param filters

Tasks live on one route, `/tasks`, with a single-page browse surface (the Task List). Filter state — the Status filter (`active` / `completed` / `all`) and an optional tag — lives in URL **search params** (`/tasks?status=active&tag=$tagId`), not in path segments. Tasks are created and edited in a dialog; there is no per-task detail route.

This deliberately diverges from [0003](./0003-notes-single-sidebar-grid-detail.md), which encodes Note filters as mutually-exclusive **routes** (`/notes/pinned`, `/notes/folder/$id`) and uses a full-width detail route for editing.

## Why

- Tasks are a flatter domain than Notes: no folders, no nesting, no rich-text body. The only filter axes are status, tag, and due date — and status/due are not mutually exclusive the way Note views are (you filter *and* sort at once). Search params model "several independent, combinable filters" naturally; path segments model "pick exactly one view" and would fight the combination.
- A todo is cheap to read and edit. A full-width detail route (the Note model) adds navigation friction for an item you glance at and check off. A dialog keeps you in the list.
- Date buckets (Overdue / Today / Upcoming) are *derived*, not stored, and change every day. Encoding them as routes (`/tasks/today`) would bake a moving target into the URL. Search-param + client/server date math keeps them computed.

## Considered options

- **Mirror Notes exactly (path-based views + detail route).** Rejected: imposes the Note information architecture (mutually-exclusive views, heavyweight detail) on a domain that doesn't have it. The consistency is superficial; the friction is real.
- **Path-based views, dialog editing (hybrid).** Rejected: still forces status/tag/date into mutually-exclusive path segments, so you can't say "active tasks tagged #work sorted by due" without inventing combinatorial routes or layering search params on top anyway — the exact 1:1-breaking situation 0003 rejected for Notes.
- **No URL state at all (component state).** Rejected: filters should be linkable and survive reload, matching the rest of the app's URL-first stance.

## Consequences

- The app now has two filtering idioms: path-based for Notes, search-param for Tasks. This is an intentional asymmetry justified by domain shape, documented here so a future reader doesn't "fix" the inconsistency. The 1:1 URL→state guarantee from 0003 applies to Notes only.
- Task filter changes are `navigate({ search })` updates, not route transitions — no skeleton swap, the list updates in place.
- Tasks never become Recent Visits (already true in [0004](./0004-recent-visits-server-tracked.md)); the dialog-not-route model reinforces this — there is no task URL to record.
- The Command Menu searches Tasks client-side over the loaded active set (no FTS), unlike Notes which query server-side FTS.
- If Tasks later grow folders/projects or a genuinely heavyweight detail, revisit — but only on that evidence.
