import { createFileRoute } from "@tanstack/react-router";

import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

export const Route = createFileRoute("/_app/tasks/completed")({
  head: () => ({ meta: [{ title: "Completed | Memora" }] }),
  component: () => <TaskListView title="Completed" view="completed" />,
  pendingComponent: TaskListSkeleton,
});
