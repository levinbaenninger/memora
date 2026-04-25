import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [{ title: "Tasks" }],
  }),
  component: TasksPage,
});

function TasksPage() {
  return <p className="text-muted-foreground text-sm">Tasks</p>;
}
