"use client";

import {
  CheckmarkCircle01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Suspense, useState } from "react";

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
import { Button } from "@memora/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@memora/ui/components/field";
import { Input } from "@memora/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@memora/ui/components/sheet";
import { Skeleton } from "@memora/ui/components/skeleton";
import { Textarea } from "@memora/ui/components/textarea";

import { useCompleteTask, useDeleteTask, useUpdateTask } from "../../mutations";
import { useTask, useTaskTagsList } from "../../queries";
import { useTasksStore } from "../../store";
import { DueDatePicker } from "./due-date-picker";
import { TaskTagCombobox } from "./task-tag-combobox";

function TaskDetailContent({ taskId }: { taskId: string }) {
  const { data: task } = useTask(taskId);
  const { data: allTags } = useTaskTagsList();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  const { setOpenTaskId } = useTasksStore();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueAt, setDueAt] = useState<Date | null>(task.dueAt ?? null);
  const [tagNames, setTagNames] = useState(task.tags.map((t) => t.name));
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isCompleted = !!task.completedAt;

  const isDirty =
    title.trim() !== task.title ||
    description !== (task.description ?? "") ||
    (dueAt?.getTime() ?? null) !== (task.dueAt?.getTime() ?? null) ||
    [...tagNames].sort().join(",") !==
      [...task.tags.map((t) => t.name)].sort().join(",");

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }
    updateTask.mutate(
      {
        id: taskId,
        title: title.trim(),
        description,
        dueAt: dueAt ?? null,
        tagNames,
      },
      { onSuccess: () => setOpenTaskId(null) }
    );
  };

  return (
    <>
      <SheetHeader className="gap-3 pr-10">
        <SheetTitle className="font-normal text-muted-foreground text-sm">
          {isCompleted ? "Completed" : "Active"}
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <FieldGroup>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input onChange={(e) => setTitle(e.target.value)} value={title} />
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details…"
              rows={4}
              value={description}
            />
          </Field>

          <Field>
            <FieldLabel>Due date</FieldLabel>
            <DueDatePicker onChange={setDueAt} value={dueAt} />
          </Field>

          <Field>
            <FieldLabel>Tags</FieldLabel>
            <TaskTagCombobox
              availableTags={allTags}
              onChange={setTagNames}
              tagNames={tagNames}
            />
          </Field>
        </FieldGroup>
      </div>

      <div className="flex items-center gap-2 border-t px-4 py-3">
        <Button
          className="gap-2"
          onClick={() =>
            completeTask.mutate({ id: taskId, completed: !isCompleted })
          }
          size="sm"
          variant="outline"
        >
          <HugeiconsIcon
            className="size-4"
            icon={isCompleted ? RefreshIcon : CheckmarkCircle01Icon}
            strokeWidth={2}
          />
          {isCompleted ? "Reopen" : "Complete"}
        </Button>

        <Button
          className="gap-2"
          disabled={!isDirty || updateTask.isPending}
          onClick={handleSave}
          size="sm"
        >
          <HugeiconsIcon
            className="size-4"
            icon={FloppyDiskIcon}
            strokeWidth={2}
          />
          {updateTask.isPending ? "Saving…" : "Save"}
        </Button>

        <Button
          className="ml-auto gap-2 text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon
            className="size-4"
            icon={Delete02Icon}
            strokeWidth={2}
          />
          Delete
        </Button>
      </div>

      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                deleteTask.mutate(
                  { id: taskId },
                  { onSuccess: () => setOpenTaskId(null) }
                )
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TaskDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function TaskDetailSheet() {
  const { openTaskId, setOpenTaskId } = useTasksStore();

  return (
    <Sheet
      onOpenChange={(open) => !open && setOpenTaskId(null)}
      open={!!openTaskId}
    >
      <SheetContent className="flex flex-col gap-0 p-0" side="right">
        {openTaskId ? (
          <Suspense fallback={<TaskDetailSkeleton />}>
            <TaskDetailContent key={openTaskId} taskId={openTaskId} />
          </Suspense>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
