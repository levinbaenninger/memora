import { createFileRoute } from "@tanstack/react-router";

import { notesListInput } from "@/modules/notes/queries";
import { NoteGridSkeleton } from "@/modules/notes/ui/views/note-grid-skeleton";
import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: notesListInput({ view: "all" }),
      })
    ),
  head: () => ({ meta: [{ title: "All Notes | Memora" }] }),
  component: () => <NoteGridView title="All Notes" view="all" />,
  pendingComponent: () => <NoteGridSkeleton title="All Notes" />,
});
