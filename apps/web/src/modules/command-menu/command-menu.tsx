"use client";

import {
  Folder01Icon,
  HashtagIcon,
  NoteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@memora/ui/components/command";
import { Spinner } from "@memora/ui/components/spinner";

import { useCommandMenu } from "./context";
import {
  useFoldersForPalette,
  useTagsForPalette,
} from "./hooks/use-eager-entities";
import { useNoteSearch } from "./hooks/use-note-search";
import { useRecents } from "./hooks/use-recents";
import { jumpToItems } from "./jump-to-items";

const MIN_QUERY_LENGTH = 2;

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useHotkey("Mod+K", (event) => {
    event.preventDefault();
    setOpen(!open);
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const noteSearch = useNoteSearch(query);
  const showNotes = query.trim().length >= MIN_QUERY_LENGTH;
  const notes = noteSearch.data ?? [];

  const showEntities = query.trim().length >= 1;
  const folders = useFoldersForPalette().data ?? [];
  const tags = useTagsForPalette().data ?? [];

  const showRecents = query.trim().length === 0;
  const recents = useRecents(open && showRecents).data ?? [];

  const recentIcon = {
    note: NoteIcon,
    folder: Folder01Icon,
    tag: HashtagIcon,
  } as const;

  const navigateToRecent = (entity: (typeof recents)[number]) => {
    if (entity.entityType === "note") {
      navigate({ to: "/notes/$noteId", params: { noteId: entity.id } });
      return;
    }
    if (entity.entityType === "folder") {
      navigate({
        to: "/notes/folder/$folderId",
        params: { folderId: entity.id },
      });
      return;
    }
    navigate({ to: "/notes/tag/$tagId", params: { tagId: entity.id } });
  };

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput
        onValueChange={setQuery}
        placeholder="Search or jump to…"
        value={query}
      />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        {showRecents && recents.length > 0 ? (
          <CommandGroup heading="Recent">
            {recents.map((entity) => (
              <CommandItem
                key={`${entity.entityType}-${entity.id}`}
                onSelect={() => run(() => navigateToRecent(entity))}
                value={`recent-${entity.entityType}-${entity.id}`}
              >
                <HugeiconsIcon
                  icon={recentIcon[entity.entityType]}
                  strokeWidth={2}
                />
                <span className="truncate">{entity.title}</span>
                {entity.folderName ? (
                  <span className="ml-auto truncate text-muted-foreground text-xs">
                    {entity.folderName}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        <CommandGroup heading="Jump to">
          {jumpToItems.map((item) => (
            <CommandItem
              key={item.id}
              keywords={item.keywords}
              onSelect={() =>
                run(() => {
                  // biome-ignore lint/suspicious/noExplicitAny: TanStack Router params type
                  navigate({ to: item.to, params: item.params as any });
                })
              }
              value={`${item.title} ${item.keywords.join(" ")}`}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
              <span>{item.title}</span>
              {item.shortcut ? (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>
        {showNotes ? (
          <CommandGroup
            forceMount
            heading={
              <span className="flex items-center gap-2">
                Notes
                {noteSearch.isFetching ? <Spinner className="size-3" /> : null}
              </span>
            }
          >
            {notes.map((note) => (
              <CommandItem
                forceMount
                key={note.id}
                onSelect={() =>
                  run(() =>
                    navigate({
                      to: "/notes/$noteId",
                      params: { noteId: note.id },
                    })
                  )
                }
                value={`note-${note.id}`}
              >
                <HugeiconsIcon icon={NoteIcon} strokeWidth={2} />
                <span className="truncate">{note.title || "Untitled"}</span>
                {note.folder ? (
                  <span className="ml-auto truncate text-muted-foreground text-xs">
                    {note.folder.name}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {showEntities && folders.length > 0 ? (
          <CommandGroup heading="Folders">
            {folders.map((folder) => (
              <CommandItem
                key={folder.id}
                keywords={[folder.name]}
                onSelect={() =>
                  run(() =>
                    navigate({
                      to: "/notes/folder/$folderId",
                      params: { folderId: folder.id },
                    })
                  )
                }
                value={`folder ${folder.name}`}
              >
                <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
                <span className="truncate">{folder.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {showEntities && tags.length > 0 ? (
          <CommandGroup heading="Tags">
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                keywords={[tag.name, tag.slug]}
                onSelect={() =>
                  run(() =>
                    navigate({
                      to: "/notes/tag/$tagId",
                      params: { tagId: tag.id },
                    })
                  )
                }
                value={`tag ${tag.name} ${tag.slug}`}
              >
                <HugeiconsIcon icon={HashtagIcon} strokeWidth={2} />
                <span className="truncate">{tag.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
