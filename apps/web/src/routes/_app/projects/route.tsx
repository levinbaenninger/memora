import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({
    meta: [{ title: "Projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return <p className="text-muted-foreground text-sm">Projects</p>;
}
