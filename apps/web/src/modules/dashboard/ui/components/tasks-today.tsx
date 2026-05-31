import { Link } from "@tanstack/react-router";

import { Spinner } from "@memora/ui/components/spinner";

import {
  bucketOf,
  endOfToday,
  startOfDayFromNow,
} from "@/modules/tasks/lib/dates";
import { useTasksList } from "@/modules/tasks/queries";
import { useTaskDialogStore } from "@/modules/tasks/store";
import {
  TaskRow,
  type TaskRowData,
} from "@/modules/tasks/ui/components/task-row";
import { DashboardCard } from "./dashboard-card";

export function TasksToday() {
  const openCreate = useTaskDialogStore((s) => s.openCreate);

  const dueToday = useTasksList({
    status: "active",
    dueBefore: endOfToday(),
    sort: "dueAt",
    limit: 8,
  });

  const upcoming = useTasksList({
    status: "active",
    dueAfter: startOfDayFromNow(1),
    dueBefore: startOfDayFromNow(8),
    sort: "dueAt",
  });

  const tasks = (dueToday.data ?? []) as TaskRowData[];
  const overdue = tasks.filter((t) => bucketOf(t.dueAt) === "overdue");
  const today = tasks.filter((t) => bucketOf(t.dueAt) === "today");
  const upcomingCount = upcoming.data?.length ?? 0;

  return (
    <DashboardCard addLabel="New task" onAdd={() => openCreate()} title="Today">
      {dueToday.isPending ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="size-5" />
        </div>
      ) : (
        <>
          {overdue.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="px-2 font-medium text-destructive text-xs">
                Overdue
              </h3>
              {overdue.map((task) => (
                <TaskRow key={task.id} plain task={task} />
              ))}
            </div>
          ) : null}

          {today.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="px-2 font-medium text-muted-foreground text-xs">
                Today
              </h3>
              {today.map((task) => (
                <TaskRow key={task.id} plain task={task} />
              ))}
            </div>
          ) : null}

          {overdue.length === 0 && today.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              Nothing due today.
            </p>
          ) : null}

          {upcomingCount > 0 ? (
            <Link
              className="px-2 pt-1 text-muted-foreground text-xs hover:text-foreground"
              to="/tasks"
            >
              {upcomingCount} upcoming in the next 7 days →
            </Link>
          ) : null}
        </>
      )}
    </DashboardCard>
  );
}
