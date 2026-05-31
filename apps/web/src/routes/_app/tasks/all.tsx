import { createFileRoute } from "@tanstack/react-router";

import { tasksListInput } from "@/modules/tasks/queries";
import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

export const Route = createFileRoute("/_app/tasks/all")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.tasks.list.queryOptions({
        input: tasksListInput({ view: "all" }),
      })
    ),
  head: () => ({ meta: [{ title: "All Tasks | Memora" }] }),
  component: () => <TaskListView title="All Tasks" view="all" />,
  pendingComponent: TaskListSkeleton,
});
