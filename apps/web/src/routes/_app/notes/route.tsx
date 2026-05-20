import { createFileRoute, Outlet } from "@tanstack/react-router";

import { NotesErrorView } from "@/modules/notes/ui/views/notes-error-view";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({
    meta: [{ title: "Notes | Memora" }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.notes.folders.list.queryOptions({ input: {} })
      ),
      context.queryClient.ensureQueryData(
        context.orpc.notes.tags.list.queryOptions()
      ),
    ]),
  component: Outlet,
  errorComponent: NotesErrorView,
});
