import { createFileRoute } from "@tanstack/react-router";

import { notesListInput } from "@/modules/notes/queries";
import { NoteGridSkeleton } from "@/modules/notes/ui/views/note-grid-skeleton";
import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/pinned")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: notesListInput({ view: "pinned" }),
      })
    ),
  head: () => ({ meta: [{ title: "Pinned | Memora" }] }),
  component: () => <NoteGridView title="Pinned" view="pinned" />,
  pendingComponent: () => <NoteGridSkeleton title="Pinned" />,
});
