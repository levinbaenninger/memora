import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/favorites")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: { favorite: true, includeArchived: false, limit: 50, offset: 0 },
      })
    ),
  head: () => ({ meta: [{ title: "Favorites | Memora" }] }),
  component: () => <NoteGridView title="Favorites" view="favorites" />,
});
