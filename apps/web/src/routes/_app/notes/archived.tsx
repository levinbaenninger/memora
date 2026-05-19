import { createFileRoute } from "@tanstack/react-router";

import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/archived")({
  head: () => ({ meta: [{ title: "Archive" }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: { includeArchived: true, limit: 50, offset: 0 },
      })
    ),
  component: () => <NoteGridView title="Archive" view="archived" />,
});
