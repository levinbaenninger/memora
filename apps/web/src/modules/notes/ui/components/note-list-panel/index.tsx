import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

import { Button } from "@memora/ui/components/button";
import { Empty, EmptyDescription } from "@memora/ui/components/empty";
import { Input } from "@memora/ui/components/input";
import { ScrollArea } from "@memora/ui/components/scroll-area";
import { Skeleton } from "@memora/ui/components/skeleton";
import { cn } from "@memora/ui/lib/utils";

import { useCreateNote } from "@/modules/notes/mutations";
import {
  useFoldersList,
  useNotesList,
  useTagsList,
} from "@/modules/notes/queries";
import { NoteListItem } from "./note-list-item";

function getListTitle(
  view: string,
  folder: { id: string; name: string } | undefined,
  tag: { id: string; name: string } | undefined
): string {
  if (folder) {
    return folder.name;
  }
  if (tag) {
    return tag.name;
  }
  if (view === "pinned") {
    return "Pinned";
  }
  if (view === "favorites") {
    return "Favorites";
  }
  if (view === "archived") {
    return "Archive";
  }
  return "All Notes";
}

export function NoteListPanel({ className }: { className?: string }) {
  const navigate = useNavigate({ from: "/notes" });
  const search = useSearch({ from: "/_app/notes" });
  const createNote = useCreateNote();

  const { notes, isPending, isError } = useNotesList({
    folderId: search.folder,
    tagId: search.tag,
    view: search.view ?? "all",
    q: search.q,
  });

  const { data: folders } = useFoldersList();
  const { data: allTags } = useTagsList();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      navigate({
        search: (prev) => ({ ...prev, q: e.target.value || undefined }),
      });
    },
    [navigate]
  );

  const handleCreate = () => {
    createNote.mutate({
      title: "Untitled",
      content: { type: "doc", content: [] },
      folderId: search.folder ?? undefined,
    });
  };

  const currentFolder = folders?.find((f) => f.id === search.folder);
  const currentTag = allTags?.find((t) => t.id === search.tag);
  const title = getListTitle(search.view ?? "all", currentFolder, currentTag);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="font-semibold text-sm">{title}</span>
        <div className="flex items-center gap-0.5">
          <Button
            className="size-7"
            disabled={createNote.isPending}
            onClick={handleCreate}
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon
              className="size-4"
              icon={Add01Icon}
              strokeWidth={2}
            />
          </Button>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <HugeiconsIcon
            className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            icon={Search01Icon}
            strokeWidth={2}
          />
          <Input
            className="h-8 pl-8 text-sm"
            onChange={handleSearch}
            placeholder="Search notes…"
            value={search.q ?? ""}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 px-2 pb-4">
          {isPending &&
            ["1", "2", "3", "4", "5"].map((key) => (
              <div className="space-y-1.5 rounded-lg px-3 py-2.5" key={key}>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          {!isPending && isError && (
            <Empty className="py-8">
              <EmptyDescription>Failed to load notes</EmptyDescription>
            </Empty>
          )}
          {!(isPending || isError) && notes.length === 0 && (
            <Empty className="py-8">
              <EmptyDescription>No notes found</EmptyDescription>
            </Empty>
          )}
          {!(isPending || isError) &&
            notes.length > 0 &&
            notes.map((note) => (
              <NoteListItem
                favorite={note.favorite}
                folderName={note.folder?.name}
                id={note.id}
                isArchived={!!note.archivedAt}
                key={note.id}
                pinned={note.pinned}
                snippet={note.snippet}
                tags={note.tags}
                title={note.title}
                updatedAt={note.updatedAt}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
