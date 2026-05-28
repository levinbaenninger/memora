import { Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { recordVisit } from "@/modules/command-menu/recent-visits-client";
import { notesListInput, useTagsList } from "@/modules/notes/queries";
import {
  TagActionsProvider,
  TagMenuItems,
} from "@/modules/notes/ui/components/tag-actions";
import { NoteGridSkeleton } from "@/modules/notes/ui/views/note-grid-skeleton";
import { NoteGridView } from "@/modules/notes/ui/views/note-grid-view";

export const Route = createFileRoute("/_app/notes/tag/$tagId")({
  loader: async ({ context, params }) => {
    recordVisit("tag", params.tagId);
    const [tags] = await Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.notes.tags.list.queryOptions()
      ),
      context.queryClient.ensureQueryData(
        context.orpc.notes.list.queryOptions({
          input: notesListInput({ view: "all", tagId: params.tagId }),
        })
      ),
    ]);
    const tag = tags.find((t) => t.id === params.tagId);
    return { tagName: tag?.name ?? "Tag" };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${
          (loaderData as { tagName?: string } | undefined)?.tagName ?? "Tag"
        } | Memora`,
      },
    ],
  }),
  component: TagView,
  pendingComponent: () => (
    <NoteGridSkeleton
      titleIcon={<HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />}
    />
  ),
});

function TagView() {
  const { tagId } = Route.useParams();
  const { tagName: initialName } = Route.useLoaderData();
  const { data: tags } = useTagsList();
  const tagName = tags.find((tag) => tag.id === tagId)?.name ?? initialName;

  useEffect(() => {
    document.title = `${tagName} | Memora`;
  }, [tagName]);

  return (
    <TagActionsProvider tagId={tagId} tagName={tagName}>
      <NoteGridView
        contextActions={<TagMenuItems />}
        tagId={tagId}
        title={tagName}
        titleIcon={<HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />}
        view="all"
      />
    </TagActionsProvider>
  );
}
