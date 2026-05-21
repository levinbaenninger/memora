import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  Delete01Icon,
  FavouriteIcon,
  PinIcon,
  PinOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@memora/ui/components/alert-dialog";
import { Badge } from "@memora/ui/components/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@memora/ui/components/context-menu";
import { cn } from "@memora/ui/lib/utils";

import {
  useArchiveNote,
  useDeleteNote,
  useRestoreNote,
  useUpdateNote,
} from "@/modules/notes/mutations";

interface NoteCardProps {
  favorite: boolean;
  folderName?: string | null;
  fromPath?: string;
  id: string;
  isArchived: boolean;
  pinned: boolean;
  snippet: string;
  tags: { id: string; name: string }[];
  title: string;
  updatedAt: Date;
}

function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) {
    return "just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}

export function NoteCard({
  id,
  title,
  snippet,
  pinned,
  favorite,
  isArchived,
  updatedAt,
  tags,
  folderName,
  fromPath,
}: NoteCardProps) {
  const updateNote = useUpdateNote();
  const archiveNote = useArchiveNote();
  const restoreNote = useRestoreNote();
  const deleteNote = useDeleteNote();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          render={(props) => (
            <div {...props} className={cn("block", props.className)} />
          )}
        >
          <Link
            className="flex h-44 flex-col rounded-lg border bg-card p-4 text-left transition-colors hover:border-accent-foreground/30 hover:bg-accent/40"
            params={{ noteId: id }}
            search={fromPath ? { from: fromPath } : undefined}
            to="/notes/$noteId"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "line-clamp-2 flex-1 font-medium text-sm leading-tight",
                  !title && "text-muted-foreground italic"
                )}
              >
                {title || "Untitled"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {pinned && (
                  <HugeiconsIcon
                    className="size-3.5 text-muted-foreground"
                    icon={PinIcon}
                    strokeWidth={2}
                  />
                )}
                {favorite && (
                  <HugeiconsIcon
                    className="size-3.5 text-muted-foreground"
                    icon={FavouriteIcon}
                    strokeWidth={2}
                  />
                )}
              </div>
            </div>

            <p
              className={cn(
                "mt-2 line-clamp-4 flex-1 text-muted-foreground text-xs",
                !snippet && "italic"
              )}
            >
              {snippet || "No content yet"}
            </p>

            <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
              <span className="text-muted-foreground text-xs">
                {relativeDate(updatedAt)}
              </span>
              {folderName && (
                <Badge className="h-4 px-1 text-[10px]" variant="outline">
                  {folderName}
                </Badge>
              )}
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  className="h-4 px-1 text-[10px]"
                  key={tag.id}
                  variant="secondary"
                >
                  #{tag.name}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-muted-foreground text-xs">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </Link>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => updateNote.mutate({ id, pinned: !pinned })}
          >
            <HugeiconsIcon
              className="size-4"
              icon={pinned ? PinOffIcon : PinIcon}
              strokeWidth={2}
            />
            {pinned ? "Unpin" : "Pin"}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => updateNote.mutate({ id, favorite: !favorite })}
          >
            <HugeiconsIcon
              className="size-4"
              icon={FavouriteIcon}
              strokeWidth={2}
            />
            {favorite ? "Unfavorite" : "Favorite"}
          </ContextMenuItem>
          <ContextMenuSeparator />
          {isArchived ? (
            <ContextMenuItem onClick={() => restoreNote.mutate(id)}>
              <HugeiconsIcon
                className="size-4"
                icon={ArchiveRestoreIcon}
                strokeWidth={2}
              />
              Restore
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => setConfirmArchive(true)}>
              <HugeiconsIcon
                className="size-4"
                icon={ArchiveIcon}
                strokeWidth={2}
              />
              Archive
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={() => setConfirmDelete(true)}
            variant="destructive"
          >
            <HugeiconsIcon
              className="size-4"
              icon={Delete01Icon}
              strokeWidth={2}
            />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog onOpenChange={setConfirmArchive} open={confirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive note?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be moved to the archive. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveNote.mutate(id)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setConfirmDelete} open={confirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteNote.mutate(id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
