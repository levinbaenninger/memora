import { CalendarIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { startTransition } from "react";

import { Badge } from "@memora/ui/components/badge";
import { Checkbox } from "@memora/ui/components/checkbox";
import { cn } from "@memora/ui/lib/utils";

import { formatDueDate, isOverdue } from "../../lib/task-dates";
import { useCompleteTask, useDeleteTask } from "../../mutations";
import { useTasksStore } from "../../store";

interface TaskRowProps {
  completedAt: Date | null;
  dueAt: Date | null;
  id: string;
  tags: { id: string; name: string }[];
  title: string;
}

export function TaskRow({ id, title, dueAt, completedAt, tags }: TaskRowProps) {
  const { setOpenTaskId } = useTasksStore();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  const isCompleted = !!completedAt;
  const overdue = isOverdue({ dueAt, completedAt });

  return (
    <button
      className={cn(
        "group flex min-h-10 w-full cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent/40",
        isCompleted && "opacity-60"
      )}
      onClick={() => setOpenTaskId(id)}
      type="button"
    >
      <span className="mt-0.5 shrink-0">
        <Checkbox
          checked={isCompleted}
          disabled={completeTask.isPending}
          onCheckedChange={(checked) => {
            startTransition(() => {
              completeTask.mutate({ id, completed: Boolean(checked) });
            });
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            isCompleted && "text-muted-foreground line-through"
          )}
        >
          {title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {dueAt ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                overdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <HugeiconsIcon
                className="size-3 shrink-0"
                icon={CalendarIcon}
                strokeWidth={2}
              />
              {formatDueDate(dueAt)}
            </span>
          ) : null}

          {tags.map((tag) => (
            <Badge
              className="h-4 px-1.5 text-[10px]"
              key={tag.id}
              variant="secondary"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <button
        aria-label="Delete task"
        className="ml-1 shrink-0 self-center rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive disabled:pointer-events-none group-hover:opacity-100"
        disabled={deleteTask.isPending}
        onClick={(e) => {
          e.stopPropagation();
          startTransition(() => {
            deleteTask.mutate({ id });
          });
        }}
        type="button"
      >
        <HugeiconsIcon className="size-4" icon={Delete02Icon} strokeWidth={2} />
      </button>
    </button>
  );
}
