import { Add01Icon, AlignLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@memora/ui/components/button";
import { Input } from "@memora/ui/components/input";

import { useCreateTask } from "../../mutations";
import { useTasksStore } from "../../store";

interface TaskQuickAddProps {
  defaultTagNames?: string[];
}

export function TaskQuickAdd({ defaultTagNames = [] }: TaskQuickAddProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();
  const { setCreateDialogOpen } = useTasksStore();

  const trimmed = value.trim();

  const handleSubmit = () => {
    if (!trimmed) {
      return;
    }
    createTask.mutate(
      { title: trimmed, tagNames: defaultTagNames },
      {
        onSuccess: () => {
          setValue("");
          toast.success("Task added");
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          className="pr-10"
          disabled={createTask.isPending}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Add a task…"
          ref={inputRef}
          value={value}
        />
        {trimmed ? (
          <Button
            className="absolute top-1/2 right-1 -translate-y-1/2"
            disabled={createTask.isPending}
            onClick={handleSubmit}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon
              className="size-3.5"
              icon={Add01Icon}
              strokeWidth={2}
            />
            <span className="sr-only">Add task</span>
          </Button>
        ) : null}
      </div>
      <Button
        onClick={() => setCreateDialogOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <HugeiconsIcon
          className="size-4"
          icon={AlignLeftIcon}
          strokeWidth={2}
        />
        Add details
      </Button>
    </div>
  );
}
