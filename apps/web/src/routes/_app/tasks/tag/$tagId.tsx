import { Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { isDefinedError, ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";

import { tasksListInput } from "@/modules/tasks/queries";
import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";
import { TaskTagNotFoundView } from "@/modules/tasks/ui/views/task-tag-not-found-view";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/tasks/tag/$tagId")({
  loader: async ({ context, params }) => {
    const [tags] = await Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.tasks.tags.list.queryOptions()
      ),
      context.queryClient
        .ensureQueryData(
          context.orpc.tasks.list.queryOptions({
            input: tasksListInput({ view: "all", tagId: params.tagId }),
          })
        )
        .catch((e: unknown) => {
          if (
            e instanceof ORPCError &&
            isDefinedError(e) &&
            e.code === "NOT_FOUND"
          ) {
            throw notFound();
          }
          throw e;
        }),
    ]);
    const tag = tags.find((t) => t.id === params.tagId);
    return { tagName: tag?.name ?? "Tag" };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${(loaderData as { tagName?: string } | undefined)?.tagName ?? "Tag"} | Memora`,
      },
    ],
  }),
  component: TagView,
  pendingComponent: () => <TaskListSkeleton />,
  notFoundComponent: TaskTagNotFoundView,
});

function TagView() {
  const { tagId } = Route.useParams();
  const { tagName: initialName } = Route.useLoaderData();
  const { data: tags } = useQuery(orpc.tasks.tags.list.queryOptions());
  const tagName = tags?.find((tag) => tag.id === tagId)?.name ?? initialName;

  useEffect(() => {
    document.title = `${tagName} | Memora`;
  }, [tagName]);

  return (
    <TaskListView
      tagId={tagId}
      title={tagName}
      titleIcon={<HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />}
      view="all"
    />
  );
}
