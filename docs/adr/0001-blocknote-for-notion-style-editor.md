# ADR 0001: BlockNote for Notion-style note editor

- Status: Accepted
- Date: 2026-05-12

## Context

The notes feature needs a Notion-like editing experience: a slash command menu (`/` → text, headings, code, lists, quote, divider, table, image, link), a floating bubble toolbar on selection (bold, italic, underline, strike, inline code, link, color, highlight), and markdown-native input shortcuts (`#␣` → H1, `**…**` → bold, ```` ``` ```` → code block, `- ␣` → bullet, etc.). The page itself should follow Notion's vertical structure: title at the top, a metadata band (tags, folder, timestamps) below, then the editor body.

The current editor is a thin wrapper around Tiptap's StarterKit with `Link`, `TaskList`, and `TaskItem` extensions. It exposes only the basics (bold/italic/lists/tasks/links via a custom top toolbar) and has no slash menu, bubble toolbar, or markdown input rules beyond the StarterKit defaults.

The app is pre-launch, so existing notes can be wiped — no data migration is needed.

## Decision

Swap the Tiptap UI layer for **BlockNote** using the official **`@blocknote/shadcn`** UI adapter.

- Editor: `@blocknote/core` + `@blocknote/react` + `@blocknote/shadcn`.
- Content storage: `notes.content` (JSONB) holds BlockNote `Block[]`. `notes.contentText` denormalisation is preserved.
- Slash menu: BlockNote defaults (paragraph, H1–H3, lists, quote, code block, divider, table, image) plus two custom items — "Link note" (internal `memora://note/{id}` mention) and "Link" (external URL).
- Bubble toolbar: BlockNote defaults — bold, italic, underline, strike, inline code, link, text color, highlight.
- Image block: kept, URL-only (no upload handler — no blob infra exists yet).
- Internal note links: custom BlockNote inline content `noteMention` carrying `noteId`; the server extracts these for the backlinks graph.
- API: `packages/api/src/modules/notes/content/schema.ts` is rewritten against BlockNote primitives — block-walking text extraction, link-mark validation, and `extractInternalNoteLinkIds` all replaced. The exported `normalizeNoteContent` surface is preserved so `create-note.ts`/`update-note.ts` stay unchanged.

## Alternatives considered

- **Extend raw Tiptap** with `tiptap-extension-slash-command`, a custom `BubbleMenu`, and additional input rules. Most control, no data shape change, but several hundred lines of glue code to build a Notion-quality slash menu + bubble + theming.
- **Vendor Novel** (Vercel's Tiptap+shadcn template). Closest visual match, no data migration, but we own the code and Novel's maintenance has slowed in 2025.
- **Plate / Lexical / Editor.js**. Plate is overkill for "Notion-lite" and uses Slate (different model). Lexical needs us to build slash/bubble UX ourselves. Editor.js has weak React story.

## Consequences

Positive:
- Slash menu, bubble toolbar, and markdown input rules are batteries-included.
- Block model maps cleanly onto the Notion mental model.
- ProseMirror is still under the hood; if we outgrow BlockNote we can drop down to PM extensions.

Negative / costs:
- Existing `notes.content` Tiptap docs are incompatible with BlockNote `Block[]`. Acceptable because pre-launch: existing rows are wiped, no migration script.
- The API content validator and internal-link extractor are rewritten — highest-risk code surface.
- BlockNote pulls in its own ProseMirror dependency tree; bundle size grows.
- The current top-row formatting toolbar buttons (bold/italic/heading/etc) are removed; BlockNote's bubble + formatting toolbar replace them. The top toolbar keeps only the save indicator and the pin/favorite/archive/delete dropdown.

## Migration plan

Pre-launch wipe. Dev/staging: truncate `notes` (and dependent `note_tags`, `note_links`) before deploying. No production data to migrate.
