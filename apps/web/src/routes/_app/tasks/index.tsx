import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";

import { tasksListInput } from "@/modules/tasks/queries";
import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

export const Route = createFileRoute("/_app/tasks/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.tasks.list.queryOptions({
        input: tasksListInput({ view: "active" }),
      })
    ),
  head: () => ({ meta: [{ title: "Tasks | Memora" }] }),
  component: () => (
    <TaskListView
      title="Tasks"
      titleIcon={<HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} />}
      view="active"
    />
  ),
  pendingComponent: TaskListSkeleton,
});
