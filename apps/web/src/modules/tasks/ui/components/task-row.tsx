import {
  Calendar01Icon,
  Delete01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@memora/ui/components/alert-dialog";
import { Badge } from "@memora/ui/components/badge";
import { Checkbox } from "@memora/ui/components/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@memora/ui/components/context-menu";
import { cn } from "@memora/ui/lib/utils";

import { bucketOf, formatDue } from "@/modules/tasks/lib/dates";
import {
  useDeleteTask,
  useToggleTaskComplete,
} from "@/modules/tasks/mutations";
import { useTaskDialogStore } from "@/modules/tasks/store";

export interface TaskRowData {
  completedAt: Date | null;
  dueAt: Date | null;
  id: string;
  tags: { id: string; name: string }[];
  title: string;
}

export function TaskRow({
  task,
  plain = false,
}: {
  plain?: boolean;
  task: TaskRowData;
}) {
  const toggle = useToggleTaskComplete();
  const deleteTask = useDeleteTask();
  const openEdit = useTaskDialogStore((s) => s.openEdit);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const completed = !!task.completedAt;
  const bucket = completed ? "no-date" : bucketOf(task.dueAt);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          render={(props) => (
            <div {...props} className={cn("block", props.className)} />
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 transition-colors",
              plain
                ? "rounded-md px-2 py-1.5 hover:bg-accent"
                : "rounded-lg border bg-card px-3 py-2.5 hover:border-accent-foreground/30 hover:bg-accent/40"
            )}
          >
            <Checkbox
              aria-label={completed ? "Mark active" : "Mark complete"}
              checked={completed}
              onCheckedChange={(checked) =>
                toggle.mutate({ id: task.id, completed: checked === true })
              }
            />
            <button
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={() => openEdit(task.id)}
              type="button"
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm",
                  completed && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </span>
              {task.dueAt && !completed ? (
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 text-xs",
                    bucket === "overdue"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon
                    className="size-3.5"
                    icon={Calendar01Icon}
                    strokeWidth={2}
                  />
                  {formatDue(task.dueAt)}
                </span>
              ) : null}
              <div className="flex shrink-0 items-center gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge
                    className="h-4 px-1 text-[10px]"
                    key={tag.id}
                    variant="secondary"
                  >
                    #{tag.name}
                  </Badge>
                ))}
                {task.tags.length > 3 ? (
                  <span className="text-muted-foreground text-xs">
                    +{task.tags.length - 3}
                  </span>
                ) : null}
              </div>
            </button>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={() => openEdit(task.id)}>
            <HugeiconsIcon
              className="size-4"
              icon={Edit02Icon}
              strokeWidth={2}
            />
            Edit
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setConfirmDelete(true)}
            variant="destructive"
          >
            <HugeiconsIcon
              className="size-4"
              icon={Delete01Icon}
              strokeWidth={2}
            />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog onOpenChange={setConfirmDelete} open={confirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Tasks are not archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTask.mutate({ id: task.id })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
