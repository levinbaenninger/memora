"use client";

import {
  Add01Icon,
  CheckmarkCircle01Icon,
  FolderIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Badge } from "@memora/ui/components/badge";
import { buttonVariants } from "@memora/ui/components/button";
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

interface NotePropertiesProps {
  folderId: string | null;
  noteId: string;
  tags: { id: string; name: string; slug: string }[];
}

export function NoteProperties({
  noteId,
  folderId,
  tags,
}: NotePropertiesProps) {
  const { data: folders } = useFoldersList();
  const { data: allTags } = useTagsList();
  const updateNote = useUpdateNote();
  const [folderOpen, setFolderOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const currentTagNames = tags.map((t) => t.name);
  const currentFolder = folders?.find((f) => f.id === folderId);

  const handleFolderSelect = (value: string) => {
    updateNote.mutate({
      id: noteId,
      folderId: value === "none" ? null : value,
    });
    setFolderOpen(false);
  };

  const handleTagToggle = (tagName: string) => {
    const next = currentTagNames.includes(tagName)
      ? currentTagNames.filter((n) => n !== tagName)
      : [...currentTagNames, tagName];
    updateNote.mutate({ id: noteId, tagNames: next });
  };

  const handleCreateTag = () => {
    const name = tagInput.trim();
    if (!name) {
      return;
    }
    updateNote.mutate({
      id: noteId,
      tagNames: [...currentTagNames, name],
    });
    setTagInput("");
    setTagPopoverOpen(false);
  };

  const filteredTags = (allTags ?? []).filter((t) =>
    t.name.toLowerCase().includes(tagInput.toLowerCase())
  );

  return (
    <div className="border-t">
      <div className="mx-auto w-full max-w-3xl space-y-3 px-6 py-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-16 shrink-0 text-muted-foreground text-xs">
            Folder
          </span>
          <Popover onOpenChange={setFolderOpen} open={folderOpen}>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 w-48 justify-start font-normal text-xs"
              )}
            >
              {currentFolder ? (
                <span className="flex items-center gap-1.5 truncate">
                  <HugeiconsIcon
                    className="size-3 shrink-0"
                    icon={FolderIcon}
                    strokeWidth={1.5}
                  />
                  {currentFolder.name}
                </span>
              ) : (
                <span className="text-muted-foreground">No folder</span>
              )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-0">
              <Command>
                <CommandInput
                  className="h-8 text-xs"
                  placeholder="Search folders…"
                />
                <CommandList>
                  <CommandEmpty>No folders found</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      data-checked={folderId ? undefined : "true"}
                      onSelect={() => handleFolderSelect("none")}
                      value="none"
                    >
                      <span className="text-muted-foreground">No folder</span>
                    </CommandItem>
                    {(folders ?? []).map((f) => (
                      <CommandItem
                        data-checked={folderId === f.id ? "true" : undefined}
                        key={f.id}
                        onSelect={() => handleFolderSelect(f.id)}
                        value={f.id}
                      >
                        <HugeiconsIcon
                          className="size-3.5 shrink-0"
                          icon={FolderIcon}
                          strokeWidth={1.5}
                        />
                        {f.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <span className="mt-1 w-16 shrink-0 text-muted-foreground text-xs">
            Tags
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <Badge
                className="cursor-pointer gap-1 hover:bg-destructive/20"
                key={tag.id}
                onClick={() => handleTagToggle(tag.name)}
                variant="secondary"
              >
                #{tag.name}
                <span className="text-[10px]">×</span>
              </Badge>
            ))}

            <Popover onOpenChange={setTagPopoverOpen} open={tagPopoverOpen}>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-5 gap-1 px-2 text-muted-foreground text-xs"
                )}
              >
                <HugeiconsIcon
                  className="size-3"
                  icon={Add01Icon}
                  strokeWidth={2}
                />
                Add tag
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 p-0">
                <Command>
                  <CommandInput
                    onValueChange={setTagInput}
                    placeholder="Search or create tag…"
                    value={tagInput}
                  />
                  <CommandList>
                    <CommandEmpty className="py-2 text-left">
                      {tagInput.trim() ? (
                        <button
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                          onClick={handleCreateTag}
                          type="button"
                        >
                          <HugeiconsIcon
                            className="size-4"
                            icon={Add01Icon}
                            strokeWidth={2}
                          />
                          Create "#{tagInput.trim()}"
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-muted-foreground text-xs">
                          No tags yet
                        </span>
                      )}
                    </CommandEmpty>
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
                                selected ? "text-primary" : "opacity-0"
                              )}
                              icon={
                                selected
                                  ? CheckmarkCircle01Icon
                                  : CheckmarkCircle01Icon
                              }
                              strokeWidth={2}
                            />
                            #{tag.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
