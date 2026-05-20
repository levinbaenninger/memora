"use client";

import {
  Add01Icon,
  ArchiveIcon,
  ArrowLeft01Icon,
  FavouriteIcon,
  Folder01Icon,
  FolderAddIcon,
  HashtagIcon,
  HeartRemoveIcon,
  NoteAddIcon,
  NoteIcon,
  PinIcon,
  PinOffIcon,
  Tag01Icon,
  UndoIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

import {
  useCreateFolder,
  useCreateNote,
  useCreateTag,
} from "@/modules/notes/mutations";
import { client, orpc } from "@/utils/orpc";
import { useCommandMenu } from "./context";
import {
  useFoldersForPalette,
  useTagsForPalette,
} from "./hooks/use-eager-entities";
import { useNoteSearch } from "./hooks/use-note-search";
import { useRecents } from "./hooks/use-recents";
import { useRouteEntityContext } from "./hooks/use-route-context";
import { jumpToItems } from "./jump-to-items";

const MIN_QUERY_LENGTH = 2;

const recentIcon = {
  note: NoteIcon,
  folder: Folder01Icon,
  tag: HashtagIcon,
} as const;

const PLACEHOLDERS = {
  root: "Search or jump to…",
  "new-folder": "Folder name…",
  "new-tag": "Tag name…",
  "move-to-folder": "Move to folder…",
  "add-tag": "Add tag…",
} as const;

const PAGE_TITLES = {
  "new-folder": "Create folder",
  "new-tag": "Create tag",
  "move-to-folder": "Move to folder",
  "add-tag": "Add tag",
} as const;

export function CommandMenu() {
  const { open, setOpen, page, setPage } = useCommandMenu();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useHotkey("Mod+K", (event) => {
    event.preventDefault();
    setOpen(!open);
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setPage("root");
    }
  }, [open, setPage]);

  const goToPage = (next: ReturnType<typeof useCommandMenu>["page"]) => {
    setQuery("");
    setPage(next);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && query.length === 0 && page !== "root") {
      event.preventDefault();
      goToPage("root");
    }
  };

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      {page === "root" ? null : (
        <SubPageHeader onBack={() => goToPage("root")} page={page} />
      )}
      <CommandInput
        onKeyDown={onInputKeyDown}
        onValueChange={setQuery}
        placeholder={PLACEHOLDERS[page]}
        value={query}
      />
      <CommandList>
        {page === "root" ? (
          <RootPage
            navigate={navigate}
            open={open}
            query={query}
            setOpen={setOpen}
            setPage={goToPage}
          />
        ) : null}
        {page === "new-folder" ? (
          <NewFolderPage navigate={navigate} query={query} setOpen={setOpen} />
        ) : null}
        {page === "new-tag" ? (
          <NewTagPage navigate={navigate} query={query} setOpen={setOpen} />
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}

function SubPageHeader({
  onBack,
  page,
}: {
  onBack: () => void;
  page: keyof typeof PAGE_TITLES;
}) {
  return (
    <div className="flex items-center gap-1 px-3 pt-2 pb-1 text-muted-foreground text-xs">
      <button
        aria-label="Back"
        className="-ml-1 inline-flex size-5 items-center justify-center rounded hover:bg-muted"
        onClick={onBack}
        type="button"
      >
        <HugeiconsIcon
          className="size-3.5"
          icon={ArrowLeft01Icon}
          strokeWidth={2}
        />
      </button>
      <span>{PAGE_TITLES[page]}</span>
    </div>
  );
}

type NavigateFn = ReturnType<typeof useNavigate>;

interface RootPageProps {
  navigate: NavigateFn;
  open: boolean;
  query: string;
  setOpen: (open: boolean) => void;
  setPage: (page: ReturnType<typeof useCommandMenu>["page"]) => void;
}

function RootPage({ navigate, open, query, setOpen, setPage }: RootPageProps) {
  const routeCtx = useRouteEntityContext();
  const trimmed = query.trim();

  const showRecents = trimmed.length === 0;
  const showEntities = trimmed.length >= 1;
  const showNotes = trimmed.length >= MIN_QUERY_LENGTH;

  const recents = useRecents(open && showRecents).data ?? [];
  const folders = useFoldersForPalette().data ?? [];
  const tags = useTagsForPalette().data ?? [];
  const noteSearch = useNoteSearch(query);
  const notes = noteSearch.data ?? [];

  const createNote = useCreateNote();

  const closeAndRun = (action: () => void) => {
    setOpen(false);
    action();
  };

  const handleCreateNote = () => {
    const folderId = routeCtx.folderId ?? undefined;
    const activeTag = routeCtx.tagId
      ? tags.find((tag) => tag.id === routeCtx.tagId)
      : null;
    const tagNames = activeTag ? [activeTag.name] : [];
    closeAndRun(() => {
      createNote.mutate({
        title: "Untitled",
        content: [],
        folderId,
        tagNames,
      });
    });
  };

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

  return (
    <>
      <CommandEmpty>No matches.</CommandEmpty>
      {showRecents && recents.length > 0 ? (
        <CommandGroup heading="Recent">
          {recents.map((entity) => (
            <CommandItem
              key={`${entity.entityType}-${entity.id}`}
              onSelect={() => closeAndRun(() => navigateToRecent(entity))}
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
              closeAndRun(() => {
                navigate({
                  to: item.to,
                  // biome-ignore lint/suspicious/noExplicitAny: router params type
                  params: item.params as any,
                });
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
      {routeCtx.noteId ? (
        <NoteContextActions
          closeAndRun={closeAndRun}
          noteId={routeCtx.noteId}
        />
      ) : null}
      <CommandGroup heading="Create">
        <CommandItem
          keywords={["new", "create"]}
          onSelect={handleCreateNote}
          value="create-note"
        >
          <HugeiconsIcon icon={NoteAddIcon} strokeWidth={2} />
          <span>New note</span>
        </CommandItem>
        <CommandItem
          keywords={["new", "create"]}
          onSelect={() => setPage("new-folder")}
          value="create-folder"
        >
          <HugeiconsIcon icon={FolderAddIcon} strokeWidth={2} />
          <span>New folder</span>
        </CommandItem>
        <CommandItem
          keywords={["new", "create"]}
          onSelect={() => setPage("new-tag")}
          value="create-tag"
        >
          <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
          <span>New tag</span>
        </CommandItem>
      </CommandGroup>
      {showNotes ? (
        <CommandGroup forceMount heading="Notes" value="notes">
          {noteSearch.isFetching && notes.length === 0 ? (
            <div className="flex items-center justify-center px-2 py-3 text-muted-foreground text-xs">
              <Spinner className="size-3" />
            </div>
          ) : null}
          {notes.map((note) => (
            <CommandItem
              forceMount
              key={note.id}
              onSelect={() =>
                closeAndRun(() =>
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
                closeAndRun(() =>
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
                closeAndRun(() =>
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
    </>
  );
}

function NoteContextActions({
  closeAndRun,
  noteId,
}: {
  closeAndRun: (action: () => void) => void;
  noteId: string;
}) {
  const queryClient = useQueryClient();
  const noteQuery = useQuery({
    ...orpc.notes.get.queryOptions({
      input: { id: noteId, includeArchived: true },
    }),
    enabled: !!noteId,
  });
  const note = noteQuery.data;

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: orpc.notes.get.key({ input: { id: noteId } }),
    });
    queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
    queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
  };

  const update = useMutation({
    mutationFn: (input: { pinned?: boolean; favorite?: boolean }) =>
      client.notes.update({ id: noteId, ...input }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to update note"),
  });

  const archive = useMutation({
    mutationFn: () => client.notes.archive({ id: noteId }),
    onSuccess: () => {
      invalidate();
      toast.success("Note archived", {
        action: {
          label: "Undo",
          onClick: () => {
            client.notes
              .restore({ id: noteId })
              .then(() => {
                invalidate();
                toast.success("Note restored");
              })
              .catch(() => toast.error("Failed to restore note"));
          },
        },
      });
    },
    onError: () => toast.error("Failed to archive note"),
  });

  const restore = useMutation({
    mutationFn: () => client.notes.restore({ id: noteId }),
    onSuccess: () => {
      invalidate();
      toast.success("Note restored");
    },
    onError: () => toast.error("Failed to restore note"),
  });

  if (!note) {
    return null;
  }

  const isArchived = !!note.archivedAt;

  return (
    <CommandGroup heading="Note actions">
      <CommandItem
        keywords={["pin", "unpin"]}
        onSelect={() =>
          closeAndRun(() => update.mutate({ pinned: !note.pinned }))
        }
        value="note-pin"
      >
        <HugeiconsIcon
          icon={note.pinned ? PinOffIcon : PinIcon}
          strokeWidth={2}
        />
        <span>{note.pinned ? "Unpin note" : "Pin note"}</span>
      </CommandItem>
      <CommandItem
        keywords={["favorite", "favourite", "star", "unfavorite"]}
        onSelect={() =>
          closeAndRun(() => update.mutate({ favorite: !note.favorite }))
        }
        value="note-favorite"
      >
        <HugeiconsIcon
          icon={note.favorite ? HeartRemoveIcon : FavouriteIcon}
          strokeWidth={2}
        />
        <span>{note.favorite ? "Unfavorite note" : "Favorite note"}</span>
      </CommandItem>
      <CommandItem
        keywords={["archive", "restore", "delete", "trash"]}
        onSelect={() =>
          closeAndRun(() => (isArchived ? restore.mutate() : archive.mutate()))
        }
        value="note-archive"
      >
        <HugeiconsIcon
          icon={isArchived ? UndoIcon : ArchiveIcon}
          strokeWidth={2}
        />
        <span>{isArchived ? "Restore note" : "Archive note"}</span>
      </CommandItem>
    </CommandGroup>
  );
}

interface SubmitPageProps {
  navigate: NavigateFn;
  query: string;
  setOpen: (open: boolean) => void;
}

function NewFolderPage({ navigate, query, setOpen }: SubmitPageProps) {
  const createFolder = useCreateFolder();
  const trimmed = query.trim();

  const handleSubmit = () => {
    if (!trimmed) {
      return;
    }
    createFolder.mutate(
      { name: trimmed },
      {
        onSuccess: (folder) => {
          setOpen(false);
          toast.success(`Folder “${folder.name}” created`);
          navigate({
            to: "/notes/folder/$folderId",
            params: { folderId: folder.id },
          });
        },
      }
    );
  };

  return (
    <CommandGroup forceMount value="new-folder-actions">
      <CommandItem
        disabled={!trimmed || createFolder.isPending}
        forceMount
        onSelect={handleSubmit}
        value="submit-new-folder"
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        <span>
          {trimmed ? `Create folder “${trimmed}”` : "Type a folder name"}
        </span>
      </CommandItem>
    </CommandGroup>
  );
}

function NewTagPage({ navigate, query, setOpen }: SubmitPageProps) {
  const createTag = useCreateTag();
  const trimmed = query.trim();

  const handleSubmit = () => {
    if (!trimmed) {
      return;
    }
    createTag.mutate(
      { name: trimmed },
      {
        onSuccess: (tag) => {
          setOpen(false);
          toast.success(`Tag “${tag.name}” created`);
          navigate({ to: "/notes/tag/$tagId", params: { tagId: tag.id } });
        },
      }
    );
  };

  return (
    <CommandGroup forceMount value="new-tag-actions">
      <CommandItem
        disabled={!trimmed || createTag.isPending}
        forceMount
        onSelect={handleSubmit}
        value="submit-new-tag"
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        <span>{trimmed ? `Create tag “${trimmed}”` : "Type a tag name"}</span>
      </CommandItem>
    </CommandGroup>
  );
}
