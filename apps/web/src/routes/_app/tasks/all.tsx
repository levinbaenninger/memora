import { ListViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";

import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

export const Route = createFileRoute("/_app/tasks/all")({
  head: () => ({ meta: [{ title: "All Tasks | Memora" }] }),
  component: () => (
    <TaskListView
      title="All Tasks"
      titleIcon={<HugeiconsIcon icon={ListViewIcon} strokeWidth={2} />}
      view="all"
    />
  ),
  pendingComponent: TaskListSkeleton,
});
