import { UserButton } from "@memora/ui/components/user/user-button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Home" }],
  }),
  component: HomeRouteComponent,
});

function HomeRouteComponent() {
  return (
    <div className="flex min-h-screen items-start justify-end p-4">
      <UserButton align="end" size="icon" />
    </div>
  );
}
