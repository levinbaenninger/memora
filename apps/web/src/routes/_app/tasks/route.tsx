import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [{ title: "Tasks" }],
  }),
  component: TasksIndexPage,
});

function TasksIndexPage() {
  return <p className="text-muted-foreground text-sm">Tasks</p>;
}
