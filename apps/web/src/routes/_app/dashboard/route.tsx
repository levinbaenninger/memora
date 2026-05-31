import { createFileRoute } from "@tanstack/react-router";

import { UPCOMING_TASKS_LIMIT } from "@/modules/dashboard/ui/components/upcoming-tasks";
import { DashboardSkeleton } from "@/modules/dashboard/ui/views/dashboard-skeleton";
import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";
import { notesListInput } from "@/modules/notes/queries";
import { tasksListInput } from "@/modules/tasks/queries";

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.notes.list.queryOptions({
          input: notesListInput({ view: "all", limit: 8 }),
        })
      ),
      context.queryClient.ensureQueryData(
        context.orpc.tasks.list.queryOptions({
          input: tasksListInput({
            view: "active",
            limit: UPCOMING_TASKS_LIMIT,
          }),
        })
      ),
    ]),
  head: () => ({
    meta: [{ title: "Dashboard | Memora" }],
  }),
  component: DashboardView,
  pendingComponent: DashboardSkeleton,
});
