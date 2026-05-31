import { Add01Icon, Alert01Icon, Task01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Suspense, useMemo } from "react";

import { Button } from "@memora/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@memora/ui/components/empty";
import { Spinner } from "@memora/ui/components/spinner";

import { bucketOf, type DueBucket } from "@/modules/tasks/lib/dates";
import { type TaskStatus, useTasksList } from "@/modules/tasks/queries";
import { useTaskDialogStore } from "@/modules/tasks/store";
import { QuickAdd } from "../components/quick-add";
import { TaskFilterBar } from "../components/task-filter-bar";
import { TaskRow, type TaskRowData } from "../components/task-row";

const BUCKET_ORDER: DueBucket[] = ["overdue", "today", "upcoming", "no-date"];
const BUCKET_LABELS: Record<DueBucket, string> = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
  "no-date": "No date",
};

interface TaskListViewProps {
  onStatusChange: (status: TaskStatus) => void;
  onTagChange: (tagId: string | null) => void;
  status: TaskStatus;
  tagId: string | null;
}

export function TaskListView({
  status,
  tagId,
  onStatusChange,
  onTagChange,
}: TaskListViewProps) {
  const openCreate = useTaskDialogStore((s) => s.openCreate);
  const { data, isPending, isError } = useTasksList({
    status,
    tagId,
    sort: status === "completed" ? "updatedAt" : "dueAt",
  });

  const tasks = (data ?? []) as TaskRowData[];

  const groups = useMemo(() => {
    if (status !== "active") {
      return null;
    }
    const map = new Map<DueBucket, TaskRowData[]>();
    for (const task of tasks) {
      const bucket = bucketOf(task.dueAt);
      const list = map.get(bucket) ?? [];
      list.push(task);
      map.set(bucket, list);
    }
    return BUCKET_ORDER.map((bucket) => ({
      bucket,
      label: BUCKET_LABELS[bucket],
      tasks: map.get(bucket) ?? [],
    })).filter((g) => g.tasks.length > 0);
  }, [tasks, status]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 font-semibold text-2xl [&>svg]:size-5">
          <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />
          Tasks
        </h1>
        <Button onClick={() => openCreate()} size="sm">
          <HugeiconsIcon className="size-4" icon={Add01Icon} strokeWidth={2} />
          New task
        </Button>
      </div>

      <Suspense
        fallback={<div className="h-9 animate-pulse rounded-lg bg-muted/50" />}
      >
        <TaskFilterBar
          onStatusChange={onStatusChange}
          onTagChange={onTagChange}
          status={status}
          tagId={tagId}
        />
      </Suspense>

      {status === "completed" ? null : <QuickAdd />}

      {isPending ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : null}

      {!isPending && isError ? (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Couldn't load tasks</EmptyTitle>
            <EmptyDescription>
              Something went wrong. Try refreshing the page.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!(isPending || isError) && tasks.length === 0 ? (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No tasks here</EmptyTitle>
            <EmptyDescription>
              {status === "completed"
                ? "Completed tasks will show up here."
                : "Add a task above to get started."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!(isPending || isError) && tasks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {groups ? (
            groups.map((group) => (
              <section className="flex flex-col gap-2" key={group.bucket}>
                <h2 className="font-medium text-muted-foreground text-sm">
                  {group.label}
                  <span className="ml-1.5 text-muted-foreground/60">
                    {group.tasks.length}
                  </span>
                </h2>
                <div className="flex flex-col gap-1.5">
                  {group.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="flex flex-col gap-1.5">
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
