import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/archived")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: { includeArchived: true, limit: 50, offset: 0 },
      })
    ),
  head: () => ({ meta: [{ title: "Archive | Memora" }] }),
  component: () => <NoteGridView title="Archive" view="archived" />,
});
