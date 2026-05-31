import { createFileRoute, Outlet } from "@tanstack/react-router";

import { TasksErrorView } from "@/modules/tasks/ui/views/tasks-error-view";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [{ title: "Tasks | Memora" }],
  }),
  component: Outlet,
  errorComponent: TasksErrorView,
});
