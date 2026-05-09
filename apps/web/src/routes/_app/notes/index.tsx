import { createFileRoute } from "@tanstack/react-router";

import { NotesEmptyView } from "@/modules/notes/ui/views/notes-empty-view";

export const Route = createFileRoute("/_app/notes/")({
  component: NotesEmptyView,
});
