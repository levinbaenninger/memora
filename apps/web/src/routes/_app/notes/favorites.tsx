import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/favorites")({
  head: () => ({ meta: [{ title: "Favorites" }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: { includeArchived: false, limit: 50, offset: 0 },
      })
    ),
  component: () => <NoteGridView title="Favorites" view="favorites" />,
});
