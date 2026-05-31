import { Task01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";

import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

export const Route = createFileRoute("/_app/tasks/")({
  head: () => ({ meta: [{ title: "Tasks | Memora" }] }),
  component: () => (
    <TaskListView
      title="Tasks"
      titleIcon={<HugeiconsIcon icon={Task01Icon} strokeWidth={2} />}
      view="active"
    />
  ),
  pendingComponent: TaskListSkeleton,
});
