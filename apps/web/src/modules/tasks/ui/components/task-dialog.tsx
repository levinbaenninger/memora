import { useQuery } from "@tanstack/react-query";
import { type KeyboardEvent, useEffect, useState } from "react";

import { Button } from "@memora/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@memora/ui/components/dialog";
import { Field, FieldLabel } from "@memora/ui/components/field";
import { Input } from "@memora/ui/components/input";
import { Spinner } from "@memora/ui/components/spinner";
import { Textarea } from "@memora/ui/components/textarea";

import { useCreateTask, useUpdateTask } from "@/modules/tasks/mutations";
import { useTask } from "@/modules/tasks/queries";
import { useTaskDialogStore } from "@/modules/tasks/store";
import { orpc } from "@/utils/orpc";
import { DuePicker } from "./due-picker";
import { TagInput } from "./tag-input";

export function TaskDialog() {
  const { open, taskId, prefillTitle, close } = useTaskDialogStore();
  const isEdit = !!taskId;

  const taskQuery = useTask(taskId);
  const task = taskQuery.data;

  const tagsQuery = useQuery({
    ...orpc.tasks.tags.list.queryOptions(),
    enabled: open,
  });
  const suggestions = (tagsQuery.data ?? []).map((t) => t.name);

  const create = useCreateTask();
  const update = useUpdateTask();
  const pending = create.isPending || update.isPending;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState<Date | null>(null);
  const [tagNames, setTagNames] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (isEdit) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueAt(task.dueAt ? new Date(task.dueAt) : null);
        setTagNames(task.tags.map((t) => t.name));
      }
    } else {
      setTitle(prefillTitle);
      setDescription("");
      setDueAt(null);
      setTagNames([]);
    }
  }, [open, isEdit, task, prefillTitle]);

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed || pending) {
      return;
    }
    if (isEdit && taskId) {
      update.mutate(
        { id: taskId, title: trimmed, description, dueAt, tagNames },
        { onSuccess: close }
      );
    } else {
      create.mutate(
        { title: trimmed, description, dueAt: dueAt ?? undefined, tagNames },
        { onSuccess: close }
      );
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const loadingEdit = isEdit && taskQuery.isPending;

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          close();
        }
      }}
      open={open}
    >
      <DialogContent onKeyDown={onKeyDown}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? "Update this task." : "Create a new task."}
          </DialogDescription>
        </DialogHeader>

        {loadingEdit ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-5" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                id="task-title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs doing?"
                value={title}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="task-desc">Description</FieldLabel>
              <Textarea
                id="task-desc"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details…"
                rows={3}
                value={description}
              />
            </Field>

            <Field>
              <FieldLabel>Due</FieldLabel>
              <DuePicker onChange={setDueAt} value={dueAt} />
            </Field>

            <Field>
              <FieldLabel>Tags</FieldLabel>
              <TagInput
                onChange={setTagNames}
                suggestions={suggestions}
                value={tagNames}
              />
            </Field>
          </div>
        )}

        <DialogFooter>
          <Button onClick={close} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            disabled={!title.trim() || pending}
            onClick={submit}
            type="button"
          >
            {isEdit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
