import { createFileRoute } from "@tanstack/react-router";

import { TaskListSkeleton } from "@/modules/tasks/ui/views/task-list-skeleton";
import { TaskListView } from "@/modules/tasks/ui/views/task-list-view";

export const Route = createFileRoute("/_app/tasks/all")({
  head: () => ({ meta: [{ title: "All Tasks | Memora" }] }),
  component: () => <TaskListView title="All Tasks" view="all" />,
  pendingComponent: TaskListSkeleton,
});
