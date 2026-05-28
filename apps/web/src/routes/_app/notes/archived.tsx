import { createFileRoute } from "@tanstack/react-router";

import { notesListInput } from "@/modules/notes/queries";
import { NoteGridSkeleton } from "@/modules/notes/ui/views/note-grid-skeleton";
import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/archived")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: notesListInput({ view: "archived" }),
      })
    ),
  head: () => ({ meta: [{ title: "Archive | Memora" }] }),
  component: () => <NoteGridView title="Archive" view="archived" />,
  pendingComponent: () => <NoteGridSkeleton title="Archive" />,
});
