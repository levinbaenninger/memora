# Memora

Memora is a personal notes workspace. Users write notes (BlockNote editor), organize them with folders and tags, and navigate via a single-sidebar shell with path-based filter routes.

## Language

### Notes

**Note**:
A user-owned document with a title and rich-text body, optionally pinned, favorited, or archived.
_Avoid_: Document, page, entry.

**Folder**:
A flat container that scopes a Note to a single parent. Folders may nest via `parentId`; a Note has at most one Folder.
_Avoid_: Notebook, directory.

**Tag**:
A user-owned label that a Note can carry many of. Many-to-many with Notes.
_Avoid_: Category, topic.

**Archive**:
The global bin holding Notes (or Folders) with a non-null `archivedAt`. Restorable until `archiveExpiresAt`.
_Avoid_: Trash, deleted.

### Tasks

**Task**:
A user-owned todo item with title, optional description, completion state, and tags.
_Avoid_: Todo, item, checklist entry.

**Active task**:
A Task with no completion timestamp — still open.

**Completed task**:
A Task marked done; records when completion happened.

**Task tag**:
A user-scoped label attached to one or more Tasks. Tag names are unique per user.
_Avoid_: Label, category.

**Complete (task)**:
Set a Task to completed or active. Completing records completion time; reopening clears it.

**Delete (task)**:
Permanently remove a Task. Tasks are not archived.

### Navigation

**View**:
A path-based filter over Notes — `all`, `pinned`, `favorites`, `archived`, `folder/$id`, or `tag/$id`. Views are mutually exclusive; URL → state is 1:1.
_Avoid_: Filter, query, smart-list.

**Grid**:
The Note browse surface — cards of Notes matching the current View.
_Avoid_: List, feed.

**Detail**:
The full-width editor surface for a single Note at `/notes/$noteId`.
_Avoid_: Editor view, page view.

### Command Menu

**Command Menu**:
The global ⌘K palette listing routes, entities (Notes, Folders, Tags), and actions. Triggered from sidebar, header search icon (mobile), or ⌘K.
_Avoid_: Command palette, quick switcher, omnibar.

**Jump-to**:
The Command Menu group for route teleports (Dashboard, All Notes, Pinned, etc.). Always present.
_Avoid_: Navigation, shortcuts, links.

**Recent Visit**:
A row in `recent_visits` recording that a user opened a Note, Folder, or Tag. Drives the Recent group in the empty-state Command Menu. Routes are not Recent Visits.
_Avoid_: History, recently viewed.

**Context Action**:
An action in the Command Menu scoped to the currently-open entity — e.g., Pin/Unpin a Note on `/notes/$noteId`, Rename Folder on `/notes/folder/$id`. Hidden when no entity is in context.
_Avoid_: Quick action, contextual command.

### Sharing

**Share Link**:
An owner-minted capability URL granting read-only access to one Note. A Note may have many Share Links. Revocable by hard delete. Optionally expires.
_Avoid_: Invite, share token (token is an implementation detail).

**Visitor**:
An unauthenticated person opening a Share Link. Not a User; has no Workspace, Folder, or Tag access.
_Avoid_: Guest, recipient, viewer.

**Public Detail**:
The stripped read-only Detail surface at `/share/$token`. Renders title, body, owner name, and `updatedAt` only — no sidebar, no Command Menu, no Folder/Tag metadata.
_Avoid_: Shared view, preview.

## Relationships

- A **Note** belongs to at most one **Folder** and carries many **Tags**.
- A **Folder** nests under at most one parent **Folder**.
- A **View** filters the **Grid**; clicking a card opens the **Detail**.
- A **Recent Visit** points to exactly one **Note**, **Folder**, or **Tag** and is removed when that entity is hard-deleted.
- The **Command Menu** reads **Folders**, **Tags**, and **Recent Visits** eagerly; it queries **Notes** lazily via FTS.
- A **Share Link** points to exactly one **Note**; deleted when the Note is hard-deleted. While the Note is archived, the Share Link resolves to 404.
- A **Visitor** opens a **Share Link** and sees a **Public Detail**; they have no access to any other entity.
- A **Task** carries many **Task tags**; **Task tags** are scoped per user and independent of Note **Tags**.

## Example dialogue

> **Dev:** "If I pin a **Note** from the **Command Menu**, does it become a **Recent Visit**?"
> **Domain expert:** "No — a **Recent Visit** records that you *opened* the **Note** (visited its **Detail** or filtered to its **Folder**/**Tag**). Pinning is a **Context Action**; it changes the **Note** but doesn't count as a visit."
>
> **Dev:** "Can I be in **Archive** and **Pinned** at the same time?"
> **Domain expert:** "No. **Views** are mutually exclusive — one **View** per URL."

## Flagged ambiguities

- "Search" was used to mean both the Command Menu's note query and a future dedicated `/search` route — resolved: Command Menu is *teleport-first*; full search lives in a separate route (deferred).
- "Recent" initially included visited routes (Dashboard, Pinned) — resolved: Recent Visits are entity-only; routes always sit in Jump-to.
