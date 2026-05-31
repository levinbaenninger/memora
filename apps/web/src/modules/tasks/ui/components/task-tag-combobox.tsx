import { Add01Icon, Cancel01Icon, Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { tagNameAlphanumericPattern } from "@memora/api";
import { Badge } from "@memora/ui/components/badge";
import { Button } from "@memora/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@memora/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@memora/ui/components/popover";
import { cn } from "@memora/ui/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TaskTagComboboxProps {
  availableTags: Tag[];
  disabled?: boolean;
  onChange: (tagNames: string[]) => void;
  tagNames: string[];
}

export function TaskTagCombobox({
  availableTags,
  disabled,
  tagNames,
  onChange,
}: TaskTagComboboxProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const trimmed = input.trim();
  const filteredTags = availableTags.filter((t) =>
    t.name.toLowerCase().includes(input.toLowerCase())
  );
  const isValidTagName =
    trimmed.length > 0 && tagNameAlphanumericPattern.test(trimmed);
  const showCreate =
    isValidTagName &&
    !filteredTags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  const showInvalidHint = trimmed.length > 0 && !isValidTagName;

  const toggle = (name: string) => {
    const next = tagNames.includes(name)
      ? tagNames.filter((n) => n !== name)
      : [...tagNames, name];
    onChange(next);
  };

  const handleCreate = () => {
    if (!trimmed) {
      return;
    }
    if (!tagNames.includes(trimmed)) {
      onChange([...tagNames, trimmed]);
    }
    setInput("");
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tagNames.map((name) => (
        <Badge
          className="group/tag relative h-6 max-w-40 gap-1 overflow-hidden leading-none"
          key={name}
          variant="secondary"
        >
          <HugeiconsIcon
            className="size-3 shrink-0 text-muted-foreground"
            icon={Tag01Icon}
            strokeWidth={1.5}
          />
          <span className="min-w-0 truncate">{name}</span>
          <button
            aria-label={`Remove tag ${name}`}
            className="absolute inset-y-0 right-0 flex aspect-square items-center justify-center rounded-full bg-background/40 text-muted-foreground opacity-0 backdrop-blur-xl backdrop-saturate-150 transition-opacity hover:text-foreground focus-visible:opacity-100 disabled:pointer-events-none group-hover/tag:opacity-100"
            disabled={disabled}
            onClick={() => toggle(name)}
            type="button"
          >
            <HugeiconsIcon
              className="size-2.5"
              icon={Cancel01Icon}
              strokeWidth={2}
            />
          </button>
        </Badge>
      ))}

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={(props) => (
            <Button
              {...props}
              className="h-6 gap-1 px-2 font-normal text-muted-foreground text-xs"
              disabled={disabled}
              size="xs"
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon
                className="size-3.5"
                icon={Add01Icon}
                strokeWidth={2}
              />
              Add tag
            </Button>
          )}
        />
        <PopoverContent align="start" className="w-52 p-0">
          <Command>
            <CommandInput
              onValueChange={setInput}
              placeholder="Tag name…"
              value={input}
            />
            <CommandList>
              {showInvalidHint ? (
                <p className="px-3 py-2 text-muted-foreground text-xs">
                  Tag name must contain only letters, numbers, and single
                  spaces.
                </p>
              ) : (
                <CommandEmpty>No tags</CommandEmpty>
              )}
              <CommandGroup>
                {filteredTags.map((tag) => {
                  const selected = tagNames.includes(tag.name);
                  return (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => toggle(tag.name)}
                      value={tag.name}
                    >
                      <span
                        className={cn(
                          "flex size-3.5 shrink-0 items-center justify-center rounded-sm border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        )}
                      >
                        {selected ? (
                          <HugeiconsIcon
                            className="size-2.5"
                            icon={Tag01Icon}
                            strokeWidth={2.5}
                          />
                        ) : null}
                      </span>
                      <span className="truncate">{tag.name}</span>
                    </CommandItem>
                  );
                })}
                {showCreate ? (
                  <CommandItem
                    onSelect={handleCreate}
                    value={`create-${trimmed}`}
                  >
                    <HugeiconsIcon
                      className="size-3.5 shrink-0"
                      icon={Add01Icon}
                      strokeWidth={2}
                    />
                    Create "{trimmed}"
                  </CommandItem>
                ) : null}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
