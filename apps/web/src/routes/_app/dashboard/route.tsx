import { createFileRoute } from "@tanstack/react-router";

import { DashboardSkeleton } from "@/modules/dashboard/ui/views/dashboard-skeleton";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { notesListInput } from "@/modules/notes/queries";

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.orpc.notes.list.queryOptions({
        input: notesListInput({ view: "all", limit: 8 }),
      })
    ),
  head: () => ({
    meta: [{ title: "Dashboard | Memora" }],
  }),
  component: DashboardView,
  pendingComponent: DashboardSkeleton,
});
