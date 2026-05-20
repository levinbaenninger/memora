import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: { includeArchived: false, limit: 50, offset: 0 },
      })
    ),
  head: () => ({ meta: [{ title: "All Notes | Memora" }] }),
  component: () => <NoteGridView title="All Notes" view="all" />,
});
