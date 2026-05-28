# Notes: single sidebar, path-based views, grid → detail

We replace the two-pane notes layout (folder/tag tree + note list panel + editor) with a single sidebar + main-content model. The sidebar holds primary nav with a contextual folder/tag tree under "Notes" whenever the path matches `/notes/*`. The main content is either a grid of note cards (browse mode) or a full-width editor (read/write mode). Filters are encoded as routes, not query params.

## Routes

- `/notes` — all notes grid (default).
- `/notes/pinned`, `/notes/favorites`, `/notes/archived` — view-filtered grids.
- `/notes/folder/$folderId` — folder-filtered grid. Folder id is flat; the breadcrumb walks ancestors via the folder tree.
- `/notes/tag/$tagName` — tag-filtered grid.
- `/notes/$noteId` — note detail (full-width editor). Static segments (`pinned`, `favorites`, `archived`, `folder`, `tag`) take precedence over the dynamic `$noteId`, so collisions are not possible given CUID/UUID note ids.

Filters are mutually exclusive (one view OR one folder OR one tag). No combinations encoded in the URL. The archive view is a global bin.

## Why

- The two-pane layout duplicated navigation (sidebar tree + list pane) and produced a broken breadcrumb because filter state lived in query params.
- Path-based filters make every view linkable, bookmarkable, and breadcrumb-able. Mutually exclusive filters keep the URL→state mapping 1:1.
- The grid → detail flow forces a clean separation between browse mode and edit mode, and removes the need for a persistent list pane.

## Considered options

- **Keep two-pane, fix breadcrumbs.** Rejected: the broken breadcrumb is a symptom; the layout doubles up nav surfaces and makes URL encoding awkward.
- **Convert note list into a second `Sidebar` component.** Rejected: shadcn's `SidebarProvider` is not designed for two siblings, and the duplicated nav surface remains.
- **Encode hierarchy in the URL (`/notes/folder/$root/$child/...` or slug paths).** Rejected: folder id alone is sufficient to filter, and ancestry is already in the DB. Pretty URLs aren't worth the slug-uniqueness and rename complexity.
- **Combine filters via query params on top of routes (`/notes/folder/$id?archived=true`).** Rejected: breaks the URL→state 1:1 mapping and complicates the breadcrumb.

## Consequences

- The existing `NoteListPanel` component is removed. `NotesNavPanel` (folders + tags) moves into the primary `AppSidebar` as contextual content under the Notes nav item.
- The `notes` route's `view`/`folder`/`tag` query params are dropped. No redirect for legacy URLs — the product is pre-release.
- Sibling navigation from the detail page is not provided; users return to the grid (or use search) to jump notes. If this proves friction, revisit with a peek-list or prev/next, but only on evidence.
- The folder/tag tree remains visible in the sidebar on the detail page so users can pivot folders without leaving the note.
