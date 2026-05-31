import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";

import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

export const Route = createFileRoute("/_app/tasks/completed")({
  head: () => ({ meta: [{ title: "Completed | Memora" }] }),
  component: () => (
    <TaskListView
      title="Completed"
      titleIcon={<HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} />}
      view="completed"
    />
  ),
  pendingComponent: TaskListSkeleton,
});
