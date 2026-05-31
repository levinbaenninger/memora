import {
  Cancel01Icon,
  Delete02Icon,
  Edit02Icon,
  Tag01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@memora/ui/components/button";
import { Input } from "@memora/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@memora/ui/components/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@memora/ui/components/popover";

import {
  useCreateTaskTag,
  useDeleteTaskTag,
  useUpdateTaskTag,
} from "@/modules/tasks/mutations";
import { useTaskTags } from "@/modules/tasks/queries";

function TagRow({ id, name }: { id: string; name: string }) {
  const update = useUpdateTaskTag();
  const remove = useDeleteTaskTag();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const startEdit = () => {
    setDraft(name);
    setEditing(true);
  };

  const save = () => {
    const next = draft.trim();
    if (!next || next === name) {
      setEditing(false);
      return;
    }
    update.mutate({ id, name: next }, { onSuccess: () => setEditing(false) });
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-md bg-accent/50 px-1 py-1">
        <Input
          autoFocus
          className="h-7 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
          onBlur={save}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              save();
            }
            if (e.key === "Escape") {
              setEditing(false);
            }
          }}
          value={draft}
        />
        <Button aria-label="Save" onClick={save} size="icon-xs" variant="ghost">
          <HugeiconsIcon
            className="size-3.5"
            icon={Tick02Icon}
            strokeWidth={2}
          />
        </Button>
        <Button
          aria-label="Cancel"
          onClick={() => setEditing(false)}
          size="icon-xs"
          variant="ghost"
        >
          <HugeiconsIcon
            className="size-3.5"
            icon={Cancel01Icon}
            strokeWidth={2}
          />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
      <button
        className="min-w-0 flex-1 truncate text-left text-sm"
        onClick={startEdit}
        type="button"
      >
        <span className="text-muted-foreground">#</span>
        {name}
      </button>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          aria-label={`Rename ${name}`}
          onClick={startEdit}
          size="icon-xs"
          variant="ghost"
        >
          <HugeiconsIcon
            className="size-3.5"
            icon={Edit02Icon}
            strokeWidth={2}
          />
        </Button>
        <Button
          aria-label={`Delete ${name}`}
          className="text-destructive hover:text-destructive"
          onClick={() => remove.mutate({ id })}
          size="icon-xs"
          variant="ghost"
        >
          <HugeiconsIcon
            className="size-3.5"
            icon={Delete02Icon}
            strokeWidth={2}
          />
        </Button>
      </div>
    </div>
  );
}

export function TaskTagsManager() {
  const { data: tags } = useTaskTags();
  const create = useCreateTaskTag();
  const [newName, setNewName] = useState("");

  const add = () => {
    const name = newName.trim();
    if (!name || create.isPending) {
      return;
    }
    create.mutate({ name }, { onSuccess: () => setNewName("") });
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className="h-8 text-muted-foreground"
            size="sm"
            variant="ghost"
          >
            <HugeiconsIcon
              className="size-4"
              icon={Tag01Icon}
              strokeWidth={2}
            />
            Manage tags
          </Button>
        }
      />
      <PopoverContent align="end" className="w-72 p-2">
        <InputGroup>
          <InputGroupInput
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                add();
              }
            }}
            placeholder="Create a tag…"
            value={newName}
          />
          {newName.trim() ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Add tag"
                disabled={create.isPending}
                onClick={add}
                size="icon-xs"
              >
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        <div className="mt-1 flex max-h-72 flex-col overflow-y-auto">
          {tags.length === 0 ? (
            <p className="px-2 py-6 text-center text-muted-foreground text-xs">
              No tags yet. Create one above.
            </p>
          ) : (
            tags.map((tag) => (
              <TagRow id={tag.id} key={tag.id} name={tag.name} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
