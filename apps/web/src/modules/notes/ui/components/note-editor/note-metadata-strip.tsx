"use client";

import {
  Add01Icon,
  Cancel01Icon,
  FolderIcon,
  Tag01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

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

import { useUpdateNote } from "@/modules/notes/mutations";
import { useFoldersList, useTagsList } from "@/modules/notes/queries";

interface NoteMetadataStripProps {
  disabled?: boolean;
  folderId: string | null;
  noteId: string;
  tags: { id: string; name: string; slug: string }[];
}

export function NoteMetadataStrip({
  disabled,
  folderId,
  noteId,
  tags,
}: NoteMetadataStripProps) {
  const { data: folders } = useFoldersList();
  const { data: allTags } = useTagsList();
  const updateNote = useUpdateNote();
  const [folderOpen, setFolderOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Local optimistic tag list. Resyncs from props on every change so the
  // server stays the source of truth, but rapid toggles compose against the
  // latest local state via functional updates instead of stale props.
  const [localTagNames, setLocalTagNames] = useState(() =>
    tags.map((t) => t.name)
  );
  useEffect(() => {
    setLocalTagNames(tags.map((t) => t.name));
  }, [tags]);

  const currentTagNames = localTagNames;
  const currentFolder = folders?.find((f) => f.id === folderId);

  const handleFolderSelect = (value: string) => {
    updateNote.mutate({
      id: noteId,
      folderId: value === "none" ? null : value,
    });
    setFolderOpen(false);
  };

  const handleTagToggle = (tagName: string) => {
    setLocalTagNames((prev) => {
      const next = prev.includes(tagName)
        ? prev.filter((n) => n !== tagName)
        : [...prev, tagName];
      updateNote.mutate({ id: noteId, tagNames: next });
      return next;
    });
  };

  const handleCreateTag = () => {
    const name = tagInput.trim();
    if (!name) {
      return;
    }
    setLocalTagNames((prev) => {
      if (prev.includes(name)) {
        return prev;
      }
      const next = [...prev, name];
      updateNote.mutate({ id: noteId, tagNames: next });
      return next;
    });
    setTagInput("");
    setTagPopoverOpen(false);
  };

  const filteredTags = (allTags ?? []).filter((t) =>
    t.name.toLowerCase().includes(tagInput.toLowerCase())
  );

  const trimmedInput = tagInput.trim();
  const showCreate =
    trimmedInput.length > 0 &&
    !filteredTags.some(
      (t) => t.name.toLowerCase() === trimmedInput.toLowerCase()
    );

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 text-sm">
      <Popover onOpenChange={setFolderOpen} open={folderOpen}>
        <PopoverTrigger
          render={(props) => (
            <Button
              {...props}
              className="h-6 gap-1.5 px-2 font-normal text-xs leading-none"
              disabled={disabled}
              size="xs"
              variant="ghost"
            >
              <HugeiconsIcon
                className="size-3.5"
                icon={FolderIcon}
                strokeWidth={1.5}
              />
              {currentFolder ? currentFolder.name : "No folder"}
            </Button>
          )}
        />
        <PopoverContent align="start" className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search folders…" />
            <CommandList>
              <CommandEmpty>No folders</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleFolderSelect("none")}
                  value="none"
                >
                  <HugeiconsIcon
                    className={cn(
                      "size-3.5 shrink-0",
                      folderId === null ? "text-foreground" : "opacity-0"
                    )}
                    icon={Tick02Icon}
                    strokeWidth={2}
                  />
                  <span className="text-muted-foreground">No folder</span>
                </CommandItem>
                {(folders ?? []).map((f) => {
                  const selected = folderId === f.id;
                  return (
                    <CommandItem
                      key={f.id}
                      onSelect={() => handleFolderSelect(f.id)}
                      value={f.id}
                    >
                      <HugeiconsIcon
                        className={cn(
                          "size-3.5 shrink-0",
                          selected ? "text-foreground" : "opacity-0"
                        )}
                        icon={Tick02Icon}
                        strokeWidth={2}
                      />
                      <HugeiconsIcon
                        className="size-3.5 shrink-0 text-muted-foreground"
                        icon={FolderIcon}
                        strokeWidth={1.5}
                      />
                      {f.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Badge
            className="group/tag relative h-6 max-w-40 gap-1 overflow-hidden leading-none"
            key={tag.id}
            variant="secondary"
          >
            <HugeiconsIcon
              className="size-3 shrink-0 text-muted-foreground"
              icon={Tag01Icon}
              strokeWidth={1.5}
            />
            <span className="min-w-0 truncate">{tag.name}</span>
            <button
              aria-label={`Remove tag ${tag.name}`}
              className="absolute inset-y-0 right-0 flex aspect-square items-center justify-center rounded-full bg-background/40 text-muted-foreground opacity-0 backdrop-blur-xl backdrop-saturate-150 transition-opacity hover:text-foreground focus-visible:opacity-100 disabled:pointer-events-none group-hover/tag:opacity-100"
              disabled={disabled}
              onClick={() => handleTagToggle(tag.name)}
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

        <Popover onOpenChange={setTagPopoverOpen} open={tagPopoverOpen}>
          <PopoverTrigger
            render={(props) => (
              <Button
                {...props}
                className="gap-1.5 font-normal text-muted-foreground"
                disabled={disabled}
                size="sm"
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
          <PopoverContent align="start" className="w-64 p-0">
            <Command>
              <CommandInput
                onValueChange={setTagInput}
                placeholder="Search or create tag…"
                value={tagInput}
              />
              <CommandList>
                {filteredTags.length === 0 && !showCreate && (
                  <CommandEmpty>No tags yet</CommandEmpty>
                )}
                <CommandGroup>
                  {filteredTags.map((tag) => {
                    const selected = currentTagNames.includes(tag.name);
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => {
                          handleTagToggle(tag.name);
                          setTagInput("");
                          if (!selected) {
                            setTagPopoverOpen(false);
                          }
                        }}
                        value={tag.name}
                      >
                        <HugeiconsIcon
                          className={cn(
                            "size-3.5 shrink-0",
                            selected ? "text-foreground" : "opacity-0"
                          )}
                          icon={Tick02Icon}
                          strokeWidth={2}
                        />
                        <HugeiconsIcon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          icon={Tag01Icon}
                          strokeWidth={1.5}
                        />
                        {tag.name}
                      </CommandItem>
                    );
                  })}
                  {showCreate && (
                    <CommandItem
                      onSelect={handleCreateTag}
                      value={`__create_${trimmedInput}`}
                    >
                      <HugeiconsIcon
                        className="size-3.5 shrink-0"
                        icon={Add01Icon}
                        strokeWidth={2}
                      />
                      Create "{trimmedInput}"
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
