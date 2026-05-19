import { FolderIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";

import { useFoldersList } from "@/modules/notes/queries";
import {
  FolderActionsProvider,
  FolderMenuItems,
} from "@/modules/notes/ui/components/folder-actions";
import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/folder/$folderId")({
  head: () => ({ meta: [{ title: "Folder" }] }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: {
          folderId: params.folderId,
          includeArchived: false,
          limit: 50,
          offset: 0,
        },
      })
    ),
  component: FolderView,
});

function FolderView() {
  const { folderId } = Route.useParams();
  const { data: folders } = useFoldersList();
  const folder = folders.find((f) => f.id === folderId);
  const name = folder?.name ?? "Folder";

  return (
    <FolderActionsProvider folderId={folderId} folderName={name}>
      <NoteGridView
        contextActions={<FolderMenuItems />}
        folderId={folderId}
        title={name}
        titleIcon={<HugeiconsIcon icon={FolderIcon} strokeWidth={2} />}
        view="all"
      />
    </FolderActionsProvider>
  );
}
