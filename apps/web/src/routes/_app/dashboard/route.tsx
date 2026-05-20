import { createFileRoute } from "@tanstack/react-router";

import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: { includeArchived: false, limit: 8, offset: 0 },
      })
    ),
  head: () => ({
    meta: [{ title: "Dashboard | Memora" }],
  }),
  component: DashboardView,
});
