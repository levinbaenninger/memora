import { createFileRoute } from "@tanstack/react-router";

import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard | Memora" }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: { includeArchived: false, limit: 8, offset: 0 },
      })
    ),
  component: DashboardView,
});
