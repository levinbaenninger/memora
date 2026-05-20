import { FolderIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";

import { recordVisit } from "@/modules/command-menu/recent-visits-client";
import { useFoldersList } from "@/modules/notes/queries";
import {
  FolderActionsProvider,
  FolderMenuItems,
} from "@/modules/notes/ui/components/folder-actions";
import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/folder/$folderId")({
  loader: async ({ context, params }) => {
    recordVisit("folder", params.folderId);
    const [folders] = await Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.notes.folders.list.queryOptions({ input: {} })
      ),
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
    ]);
    const folder = folders.find((f) => f.id === params.folderId);
    return { folderName: folder?.name ?? "Folder" };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${
          (loaderData as { folderName?: string } | undefined)?.folderName ??
          "Folder"
        } | Memora`,
      },
    ],
  }),
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
