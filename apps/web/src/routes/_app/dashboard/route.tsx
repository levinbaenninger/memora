import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return <p className="text-muted-foreground text-sm">Dashboard</p>;
}
