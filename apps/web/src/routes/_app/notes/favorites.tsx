import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/favorites")({
  head: () => ({ meta: [{ title: "Favorites | Memora" }] }),
  component: () => <NoteGridView title="Favorites" view="favorites" />,
});
