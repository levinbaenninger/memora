"use client";

import {
  Add01Icon,
  Alert02Icon,
  ArchiveIcon,
  ArrowLeft01Icon,
  Delete02Icon,
  Edit02Icon,
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
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@memora/ui/components/command";
import { Spinner } from "@memora/ui/components/spinner";

import {
  useArchiveFolder,
  useCreateFolder,
  useCreateNote,
  useCreateTag,
  useDeleteFolder,
  useDeleteTag,
  useUpdateFolder,
  useUpdateTag,
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
  "rename-folder": "New folder name…",
  "rename-tag": "New tag name…",
  "delete-folder": "Press Enter to delete…",
  "delete-tag": "Press Enter to delete…",
  "move-to-folder": "Move to folder…",
  "add-tag": "Add tag…",
} as const;

const PAGE_TITLES = {
  "new-folder": "Create folder",
  "rename-folder": "Rename folder",
  "rename-tag": "Rename tag",
  "delete-folder": "Delete folder",
  "delete-tag": "Delete tag",
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
        {page === "rename-folder" ? (
          <RenameFolderPage query={query} setOpen={setOpen} />
        ) : null}
        {page === "rename-tag" ? (
          <RenameTagPage query={query} setOpen={setOpen} />
        ) : null}
        {page === "delete-folder" ? (
          <DeleteFolderPage navigate={navigate} setOpen={setOpen} />
        ) : null}
        {page === "delete-tag" ? (
          <DeleteTagPage navigate={navigate} setOpen={setOpen} />
        ) : null}
        {page === "move-to-folder" ? (
          <MoveToFolderPage navigate={navigate} setOpen={setOpen} />
        ) : null}
        {page === "add-tag" ? <AddTagPage /> : null}
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
          setPage={setPage}
        />
      ) : null}
      {routeCtx.folderId && !routeCtx.noteId ? (
        <FolderContextActions
          closeAndRun={closeAndRun}
          folderId={routeCtx.folderId}
          setPage={setPage}
        />
      ) : null}
      {routeCtx.tagId && !routeCtx.noteId ? (
        <TagContextActions
          closeAndRun={closeAndRun}
          setPage={setPage}
          tagId={routeCtx.tagId}
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
          <CommandShortcut>⌘N</CommandShortcut>
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
        <NotesGroup
          closeAndRun={closeAndRun}
          isFetching={noteSearch.isFetching}
          navigate={navigate}
          notes={notes}
          query={trimmed}
        />
      ) : null}
      {showEntities ? (
        <FoldersGroup
          closeAndRun={closeAndRun}
          folders={folders}
          navigate={navigate}
          query={trimmed}
        />
      ) : null}
      {showEntities ? (
        <TagsGroup
          closeAndRun={closeAndRun}
          navigate={navigate}
          query={trimmed}
          tags={tags}
        />
      ) : null}
    </>
  );
}

function NoteContextActions({
  closeAndRun,
  noteId,
  setPage,
}: {
  closeAndRun: (action: () => void) => void;
  noteId: string;
  setPage: (page: ReturnType<typeof useCommandMenu>["page"]) => void;
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
        <CommandShortcut>⌘⇧P</CommandShortcut>
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
        <CommandShortcut>⌘⇧F</CommandShortcut>
      </CommandItem>
      <CommandItem
        keywords={["move", "folder"]}
        onSelect={() => setPage("move-to-folder")}
        value="note-move"
      >
        <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
        <span>Move to folder…</span>
      </CommandItem>
      <CommandItem
        keywords={["tag", "label"]}
        onSelect={() => setPage("add-tag")}
        value="note-add-tag"
      >
        <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
        <span>Add tag…</span>
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
        {isArchived ? null : <CommandShortcut>⌘⌫</CommandShortcut>}
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

function FolderContextActions({
  closeAndRun,
  folderId,
  setPage,
}: {
  closeAndRun: (action: () => void) => void;
  folderId: string;
  setPage: (page: ReturnType<typeof useCommandMenu>["page"]) => void;
}) {
  const folders = useFoldersForPalette().data ?? [];
  const folder = folders.find((f) => f.id === folderId);
  const queryClient = useQueryClient();
  const archive = useArchiveFolder();

  const isArchived = !!folder?.archivedAt;

  const restore = useMutation({
    mutationFn: () => client.notes.folders.restore({ id: folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.folders.list.key(),
      });
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      toast.success("Folder restored");
    },
    onError: () => toast.error("Failed to restore folder"),
  });

  if (!folder) {
    return null;
  }

  return (
    <CommandGroup heading="Folder actions">
      <CommandItem
        keywords={["rename", "edit"]}
        onSelect={() => setPage("rename-folder")}
        value="folder-rename"
      >
        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
        <span>Rename folder</span>
      </CommandItem>
      <CommandItem
        keywords={["archive", "restore"]}
        onSelect={() =>
          closeAndRun(() =>
            isArchived ? restore.mutate() : archive.mutate(folderId)
          )
        }
        value="folder-archive"
      >
        <HugeiconsIcon
          icon={isArchived ? UndoIcon : ArchiveIcon}
          strokeWidth={2}
        />
        <span>{isArchived ? "Restore folder" : "Archive folder"}</span>
      </CommandItem>
      <CommandItem
        keywords={["delete", "remove"]}
        onSelect={() => setPage("delete-folder")}
        value="folder-delete"
      >
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        <span>Delete folder…</span>
      </CommandItem>
    </CommandGroup>
  );
}

function TagContextActions({
  setPage,
  tagId,
}: {
  closeAndRun: (action: () => void) => void;
  setPage: (page: ReturnType<typeof useCommandMenu>["page"]) => void;
  tagId: string;
}) {
  const tags = useTagsForPalette().data ?? [];
  const tag = tags.find((t) => t.id === tagId);

  if (!tag) {
    return null;
  }

  return (
    <CommandGroup heading="Tag actions">
      <CommandItem
        keywords={["rename", "edit"]}
        onSelect={() => setPage("rename-tag")}
        value="tag-rename"
      >
        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
        <span>Rename tag</span>
      </CommandItem>
      <CommandItem
        keywords={["delete", "remove"]}
        onSelect={() => setPage("delete-tag")}
        value="tag-delete"
      >
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        <span>Delete tag…</span>
      </CommandItem>
    </CommandGroup>
  );
}

interface EntityPageProps {
  query: string;
  setOpen: (open: boolean) => void;
}

function RenameFolderPage({ query, setOpen }: EntityPageProps) {
  const { folderId } = useRouteEntityContext();
  const folders = useFoldersForPalette().data ?? [];
  const folder = folders.find((f) => f.id === folderId);
  const updateFolder = useUpdateFolder();
  const trimmed = query.trim();
  const canSubmit =
    !!folderId && trimmed.length > 0 && trimmed !== folder?.name;

  const handleSubmit = () => {
    if (!(canSubmit && folderId)) {
      return;
    }
    updateFolder.mutate(
      { id: folderId, name: trimmed },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Folder renamed");
        },
      }
    );
  };

  let label: string;
  if (trimmed) {
    label = `Rename to “${trimmed}”`;
  } else if (folder) {
    label = `Current name: ${folder.name}`;
  } else {
    label = "Type a new name";
  }

  return (
    <CommandGroup forceMount value="rename-folder-actions">
      <CommandItem
        disabled={!canSubmit || updateFolder.isPending}
        forceMount
        onSelect={handleSubmit}
        value="submit-rename-folder"
      >
        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
        <span>{label}</span>
      </CommandItem>
    </CommandGroup>
  );
}

function RenameTagPage({ query, setOpen }: EntityPageProps) {
  const { tagId } = useRouteEntityContext();
  const tags = useTagsForPalette().data ?? [];
  const tag = tags.find((t) => t.id === tagId);
  const updateTag = useUpdateTag();
  const trimmed = query.trim();
  const canSubmit = !!tagId && trimmed.length > 0 && trimmed !== tag?.name;

  const handleSubmit = () => {
    if (!(canSubmit && tagId)) {
      return;
    }
    updateTag.mutate(
      { id: tagId, name: trimmed },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Tag renamed");
        },
      }
    );
  };

  let label: string;
  if (trimmed) {
    label = `Rename to “${trimmed}”`;
  } else if (tag) {
    label = `Current name: ${tag.name}`;
  } else {
    label = "Type a new name";
  }

  return (
    <CommandGroup forceMount value="rename-tag-actions">
      <CommandItem
        disabled={!canSubmit || updateTag.isPending}
        forceMount
        onSelect={handleSubmit}
        value="submit-rename-tag"
      >
        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
        <span>{label}</span>
      </CommandItem>
    </CommandGroup>
  );
}

interface DeletePageProps {
  navigate: NavigateFn;
  setOpen: (open: boolean) => void;
}

function DeleteFolderPage({ navigate, setOpen }: DeletePageProps) {
  const { folderId } = useRouteEntityContext();
  const folders = useFoldersForPalette().data ?? [];
  const folder = folders.find((f) => f.id === folderId);
  const deleteFolder = useDeleteFolder();

  const handleConfirm = () => {
    if (!folderId) {
      return;
    }
    deleteFolder.mutate(folderId, {
      onSuccess: () => {
        setOpen(false);
        navigate({ to: "/notes" });
      },
    });
  };

  return (
    <CommandGroup forceMount value="delete-folder-actions">
      <CommandItem
        disabled={!folderId || deleteFolder.isPending}
        forceMount
        onSelect={handleConfirm}
        value="confirm-delete-folder"
      >
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        <span>
          {folder
            ? `Delete folder “${folder.name}” permanently`
            : "Confirm delete"}
        </span>
      </CommandItem>
    </CommandGroup>
  );
}

function DeleteTagPage({ navigate, setOpen }: DeletePageProps) {
  const { tagId } = useRouteEntityContext();
  const tags = useTagsForPalette().data ?? [];
  const tag = tags.find((t) => t.id === tagId);
  const deleteTag = useDeleteTag();

  const handleConfirm = () => {
    if (!tagId) {
      return;
    }
    deleteTag.mutate(tagId, {
      onSuccess: () => {
        setOpen(false);
        navigate({ to: "/notes" });
      },
    });
  };

  return (
    <CommandGroup forceMount value="delete-tag-actions">
      <CommandItem
        disabled={!tagId || deleteTag.isPending}
        forceMount
        onSelect={handleConfirm}
        value="confirm-delete-tag"
      >
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        <span>
          {tag ? `Delete tag “${tag.name}” permanently` : "Confirm delete"}
        </span>
      </CommandItem>
    </CommandGroup>
  );
}

function MoveToFolderPage({ navigate, setOpen }: DeletePageProps) {
  const { noteId } = useRouteEntityContext();
  const folders = useFoldersForPalette().data ?? [];
  const queryClient = useQueryClient();

  const move = useMutation({
    mutationFn: (folderId: string | null) =>
      client.notes.update({ id: noteId ?? "", folderId }),
    onSuccess: (_data, folderId) => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.get.key({ input: { id: noteId ?? "" } }),
      });
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
      setOpen(false);
      toast.success("Note moved");
      if (folderId) {
        navigate({
          to: "/notes/folder/$folderId",
          params: { folderId },
        });
      }
    },
    onError: () => toast.error("Failed to move note"),
  });

  if (!noteId) {
    return null;
  }

  return (
    <CommandGroup forceMount heading="Folders" value="move-to-folder-list">
      <CommandItem
        keywords={["root", "none", "no folder"]}
        onSelect={() => move.mutate(null)}
        value="move-no-folder"
      >
        <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
        <span className="text-muted-foreground italic">(No folder)</span>
      </CommandItem>
      {folders.map((folder) => (
        <CommandItem
          key={folder.id}
          keywords={[folder.name]}
          onSelect={() => move.mutate(folder.id)}
          value={`move-${folder.id} ${folder.name}`}
        >
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
          <span className="truncate">{folder.name}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

function AddTagPage() {
  const { noteId } = useRouteEntityContext();
  const tags = useTagsForPalette().data ?? [];
  const queryClient = useQueryClient();

  const noteQuery = useQuery({
    ...orpc.notes.get.queryOptions({
      input: { id: noteId ?? "", includeArchived: true },
    }),
    enabled: !!noteId,
  });
  const noteTagNames = new Set(
    (noteQuery.data?.tags ?? []).map((tag) => tag.name)
  );

  const update = useMutation({
    mutationFn: (tagNames: string[]) =>
      client.notes.update({ id: noteId ?? "", tagNames }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.get.key({ input: { id: noteId ?? "" } }),
      });
      queryClient.invalidateQueries({ queryKey: orpc.notes.tags.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.list.key() });
      queryClient.invalidateQueries({ queryKey: orpc.notes.search.key() });
    },
    onError: () => toast.error("Failed to update tags"),
  });

  if (!noteId) {
    return null;
  }

  const toggle = (tagName: string) => {
    const next = new Set(noteTagNames);
    if (next.has(tagName)) {
      next.delete(tagName);
    } else {
      next.add(tagName);
    }
    update.mutate([...next]);
  };

  return (
    <CommandGroup forceMount heading="Tags" value="add-tag-list">
      {tags.map((tag) => {
        const checked = noteTagNames.has(tag.name);
        return (
          <CommandItem
            key={tag.id}
            keywords={[tag.name, tag.slug]}
            onSelect={() => toggle(tag.name)}
            value={`tag-${tag.id} ${tag.name}`}
          >
            <HugeiconsIcon icon={HashtagIcon} strokeWidth={2} />
            <span className="truncate">{tag.name}</span>
            {checked ? (
              <span className="ml-auto text-muted-foreground text-xs">✓</span>
            ) : null}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

type FoldersList = ReturnType<typeof useFoldersForPalette>["data"];
type TagsList = ReturnType<typeof useTagsForPalette>["data"];
type NotesList = ReturnType<typeof useNoteSearch>["data"];

function EmptyRow({ message }: { message: string }) {
  return (
    <div
      className="px-2 py-3 text-center text-muted-foreground text-xs italic"
      data-slot="command-empty-row"
    >
      {message}
    </div>
  );
}

function NotesGroup({
  closeAndRun,
  isFetching,
  navigate,
  notes,
  query,
}: {
  closeAndRun: (action: () => void) => void;
  isFetching: boolean;
  navigate: NavigateFn;
  notes: NonNullable<NotesList>;
  query: string;
}) {
  const noResults = !isFetching && notes.length === 0;

  return (
    <CommandGroup forceMount heading="Notes" value="notes">
      {isFetching && notes.length === 0 ? (
        <div className="flex items-center justify-center px-2 py-3 text-muted-foreground text-xs">
          <Spinner className="size-3" />
        </div>
      ) : null}
      {noResults ? <EmptyRow message={`No notes match “${query}”`} /> : null}
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
  );
}

function FoldersGroup({
  closeAndRun,
  folders,
  navigate,
  query,
}: {
  closeAndRun: (action: () => void) => void;
  folders: NonNullable<FoldersList>;
  navigate: NavigateFn;
  query: string;
}) {
  const q = query.toLowerCase();
  const matches = folders.filter((folder) =>
    folder.name.toLowerCase().includes(q)
  );

  return (
    <CommandGroup forceMount heading="Folders" value="folders">
      {matches.length === 0 ? (
        <EmptyRow message={`No folders match “${query}”`} />
      ) : null}
      {matches.map((folder) => (
        <CommandItem
          forceMount
          key={folder.id}
          onSelect={() =>
            closeAndRun(() =>
              navigate({
                to: "/notes/folder/$folderId",
                params: { folderId: folder.id },
              })
            )
          }
          value={`folder-${folder.id}`}
        >
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
          <span className="truncate">{folder.name}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

function TagsGroup({
  closeAndRun,
  navigate,
  query,
  tags,
}: {
  closeAndRun: (action: () => void) => void;
  navigate: NavigateFn;
  query: string;
  tags: NonNullable<TagsList>;
}) {
  const q = query.toLowerCase();
  const matches = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(q) || tag.slug.toLowerCase().includes(q)
  );

  return (
    <CommandGroup forceMount heading="Tags" value="tags">
      {matches.length === 0 ? (
        <EmptyRow message={`No tags match “${query}”`} />
      ) : null}
      {matches.map((tag) => (
        <CommandItem
          forceMount
          key={tag.id}
          onSelect={() =>
            closeAndRun(() =>
              navigate({
                to: "/notes/tag/$tagId",
                params: { tagId: tag.id },
              })
            )
          }
          value={`tag-${tag.id}`}
        >
          <HugeiconsIcon icon={HashtagIcon} strokeWidth={2} />
          <span className="truncate">{tag.name}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
