import { createFileRoute, Outlet } from "@tanstack/react-router";

import { NotesErrorView } from "@/modules/notes/ui/views/notes-error-view";

export const Route = createFileRoute("/_app/notes")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.notes.folders.list.queryOptions({ input: {} })
      ),
      context.queryClient.ensureQueryData(
        context.orpc.notes.tags.list.queryOptions()
      ),
    ]),
  head: () => ({
    meta: [{ title: "Notes | Memora" }],
  }),
  component: Outlet,
  errorComponent: NotesErrorView,
});
