import { createFileRoute, Outlet } from "@tanstack/react-router";

import { NotesErrorView } from "@/modules/notes/ui/views/notes-error-view";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({
    meta: [{ title: "Notes | Memora" }],
  }),
  component: Outlet,
  errorComponent: NotesErrorView,
});
