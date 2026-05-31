import {
  CheckmarkCircle01Icon,
  ListViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

import { Button } from "@memora/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@memora/ui/components/empty";

import { sortTasks } from "../../lib/task-dates";
import type { TaskView } from "../../queries";
import { useTasksList } from "../../queries";
import { useTasksStore } from "../../store";
import { TaskCreateDialog } from "../components/task-create-dialog";
import { TaskDetailSheet } from "../components/task-detail-sheet";
import { TaskQuickAdd } from "../components/task-quick-add";
import { TaskRow } from "../components/task-row";

interface TaskListViewProps {
  contextActions?: ReactNode;
  tagId?: string | null;
  title: string;
  titleIcon?: ReactNode;
  view: TaskView;
}

function getEmptyTitle(view: TaskView, tagId: string | null | undefined) {
  if (view === "active") {
    return "No active tasks";
  }
  if (view === "completed") {
    return "No completed tasks";
  }
  if (tagId) {
    return "No tasks with this tag";
  }
  return "No tasks yet";
}

function getEmptyDescription(view: TaskView, tagId: string | null | undefined) {
  if (view === "active") {
    return "Create a task to track what you need to get done.";
  }
  if (view === "completed") {
    return "Completed tasks will appear here.";
  }
  if (tagId) {
    return "No tasks carry this tag yet.";
  }
  return "Create your first task to get started.";
}

const TASK_LIMIT = 50;

export function TaskListView({
  contextActions,
  tagId,
  title,
  titleIcon,
  view,
}: TaskListViewProps) {
  const { data: tasks } = useTasksList({ view, tagId });
  const { setCreateDialogOpen } = useTasksStore();
  const sorted = sortTasks(tasks);
  const isTruncated = tasks.length >= TASK_LIMIT;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 font-semibold text-2xl [&>svg]:size-5">
          {titleIcon}
          {title}
          {sorted.length > 0 ? (
            <span className="ml-1 font-normal text-base text-muted-foreground">
              {sorted.length}
            </span>
          ) : null}
        </h1>
        <div className="flex items-center gap-2">
          {contextActions}
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <HugeiconsIcon
              className="size-4"
              icon={ListViewIcon}
              strokeWidth={2}
            />
            New task
          </Button>
        </div>
      </div>

      {view === "active" || view === "all" ? <TaskQuickAdd /> : null}

      {isTruncated ? (
        <p className="text-muted-foreground text-xs">
          Showing first {TASK_LIMIT} tasks. Use tags or filters to narrow
          results.
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>{getEmptyTitle(view, tagId)}</EmptyTitle>
            <EmptyDescription>
              {getEmptyDescription(view, tagId)}
            </EmptyDescription>
          </EmptyHeader>
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

      <TaskCreateDialog />
      <TaskDetailSheet />
    </div>
  );
}
