import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/")({
  head: () => ({ meta: [{ title: "All Notes | Memora" }] }),
  component: () => <NoteGridView title="All Notes" view="all" />,
});
