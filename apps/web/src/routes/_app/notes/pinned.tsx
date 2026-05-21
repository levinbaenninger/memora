import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/pinned")({
  head: () => ({ meta: [{ title: "Pinned | Memora" }] }),
  component: () => <NoteGridView title="Pinned" view="pinned" />,
});
