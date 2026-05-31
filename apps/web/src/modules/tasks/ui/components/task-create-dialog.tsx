import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@memora/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@memora/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@memora/ui/components/field";
import { Input } from "@memora/ui/components/input";
import { Textarea } from "@memora/ui/components/textarea";

import { orpc } from "@/utils/orpc";
import { useCreateTask } from "../../mutations";
import { useTasksStore } from "../../store";
import { DueDatePicker } from "./due-date-picker";
import { TaskTagCombobox } from "./task-tag-combobox";

interface TaskCreateDialogInnerProps {
  defaultTagNames?: string[];
  onClose: () => void;
}

function TaskCreateDialogInner({
  onClose,
  defaultTagNames = [],
}: TaskCreateDialogInnerProps) {
  const { data: allTags = [] } = useQuery(orpc.tasks.tags.list.queryOptions());
  const createTask = useCreateTask();
  const { setOpenTaskId } = useTasksStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState<Date | null>(null);
  const [tagNames, setTagNames] = useState<string[]>(defaultTagNames);

  const trimmedTitle = title.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedTitle) {
      return;
    }
    createTask.mutate(
      {
        title: trimmedTitle,
        description: description.trim(),
        dueAt: dueAt ?? undefined,
        tagNames,
      },
      {
        onSuccess: (task) => {
          onClose();
          setOpenTaskId(task.id);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>New task</DialogTitle>
      </DialogHeader>

      <div className="px-6 pb-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="task-title">Title</FieldLabel>
            <Input
              autoFocus
              id="task-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              value={title}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="task-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Textarea
              id="task-description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details…"
              rows={3}
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

      <DialogFooter>
        <Button onClick={onClose} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={!trimmedTitle || createTask.isPending} type="submit">
          Create task
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TaskCreateDialog({
  defaultTagNames,
}: {
  defaultTagNames?: string[];
}) {
  const { createDialogOpen, setCreateDialogOpen } = useTasksStore();

  return (
    <Dialog onOpenChange={setCreateDialogOpen} open={createDialogOpen}>
      {createDialogOpen ? (
        <DialogContent className="max-w-md">
          <TaskCreateDialogInner
            defaultTagNames={defaultTagNames}
            onClose={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
