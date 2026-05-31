"use client";

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Badge } from "@memora/ui/components/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@memora/ui/components/empty";

import { isOverdue, sortTasks } from "@/modules/tasks/lib/task-dates";
import { tasksListInput } from "@/modules/tasks/queries";
import { TaskDetailSheet } from "@/modules/tasks/ui/components/task-detail-sheet";
import { TaskRow } from "@/modules/tasks/ui/components/task-row";
import { orpc } from "@/utils/orpc";

export const UPCOMING_TASKS_LIMIT = 5;

export function UpcomingTasks() {
  const { data: tasks } = useSuspenseQuery(
    orpc.tasks.list.queryOptions({
      input: tasksListInput({ view: "active", limit: UPCOMING_TASKS_LIMIT }),
    })
  );

  const sorted = sortTasks(tasks);
  const overdueCount = sorted.filter(isOverdue).length;

  return (
    <section aria-label="Upcoming Tasks" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-sm">Upcoming Tasks</h2>
          {overdueCount > 0 && (
            <Badge className="h-4 px-1.5 text-[10px]" variant="destructive">
              {overdueCount} overdue
            </Badge>
          )}
        </div>
        <Link
          className="text-muted-foreground text-xs hover:text-foreground"
          to="/tasks"
        >
          View all
        </Link>
      </div>

      {sorted.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon
                aria-hidden="true"
                icon={CheckmarkCircle01Icon}
                strokeWidth={2}
              />
            </EmptyMedia>
            <EmptyTitle>All caught up!</EmptyTitle>
            <EmptyDescription>No active tasks right now.</EmptyDescription>
          </EmptyHeader>
          <Link
            className="text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
            to="/tasks"
          >
            Add a task
          </Link>
        </Empty>
      ) : (
        <div className="flex flex-col gap-1.5">
          {sorted.map((task) => (
            <TaskRow
              completedAt={task.completedAt}
              dueAt={task.dueAt}
              id={task.id}
              key={task.id}
              tags={task.tags}
              title={task.title}
            />
          ))}
        </div>
      )}

      <TaskDetailSheet />
    </section>
  );
}
