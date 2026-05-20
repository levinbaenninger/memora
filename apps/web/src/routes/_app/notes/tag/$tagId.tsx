import { Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";

import { recordVisit } from "@/modules/command-menu/recent-visits-client";
import { useTagsList } from "@/modules/notes/queries";
import {
  TagActionsProvider,
  TagMenuItems,
} from "@/modules/notes/ui/components/tag-actions";
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
          input: { includeArchived: false, limit: 50, offset: 0 },
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
});

function TagView() {
  const { tagId } = Route.useParams();
  const { data: tags } = useTagsList();
  const tag = tags.find((t) => t.id === tagId);
  const name = tag?.name ?? "Tag";

  return (
    <TagActionsProvider tagId={tagId} tagName={name}>
      <NoteGridView
        contextActions={<TagMenuItems />}
        tagId={tagId}
        title={name}
        titleIcon={<HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />}
        view="all"
      />
    </TagActionsProvider>
  );
}
