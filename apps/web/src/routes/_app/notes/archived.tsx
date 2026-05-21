import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/archived")({
  head: () => ({ meta: [{ title: "Archive | Memora" }] }),
  component: () => <NoteGridView title="Archive" view="archived" />,
});
