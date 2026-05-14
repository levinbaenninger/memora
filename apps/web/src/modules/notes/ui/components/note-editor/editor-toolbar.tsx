"use client";

import {
  ArchiveIcon,
  Delete01Icon,
  FavouriteIcon,
  MoreHorizontalIcon,
  PinIcon,
  PinOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { buttonVariants } from "@memora/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@memora/ui/components/dropdown-menu";
import { cn } from "@memora/ui/lib/utils";

import {
  useArchiveNote,
  useDeleteNote,
  useUpdateNote,
} from "@/modules/notes/mutations";
import type { SaveStatus } from "@/modules/notes/store";
import { useNotesStore } from "@/modules/notes/store";

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") {
    return null;
  }
  return (
    <span
      className={cn(
        "text-xs",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-muted-foreground",
        status === "error" && "text-destructive"
      )}
    >
      {status === "saving" && "Saving…"}
      {status === "saved" && "Saved"}
      {status === "error" && "Save failed"}
    </span>
  );
}

interface EditorToolbarProps {
  favorite: boolean;
  noteId: string;
  pinned: boolean;
}

export function EditorToolbar({
  noteId,
  pinned,
  favorite,
}: EditorToolbarProps) {
  const { saveStatus } = useNotesStore();
  const updateNote = useUpdateNote();
  const archiveNote = useArchiveNote();
  const deleteNote = useDeleteNote();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="border-b">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 py-2">
          <SaveIndicator status={saveStatus} />

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" })
                )}
              >
                <HugeiconsIcon
                  className="size-4"
                  icon={MoreHorizontalIcon}
                  strokeWidth={2}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    updateNote.mutate({ id: noteId, pinned: !pinned })
                  }
                >
                  <HugeiconsIcon
                    className="mr-2 size-4"
                    icon={pinned ? PinOffIcon : PinIcon}
                    strokeWidth={2}
                  />
                  {pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateNote.mutate({ id: noteId, favorite: !favorite })
                  }
                >
                  <HugeiconsIcon
                    className="mr-2 size-4"
                    icon={FavouriteIcon}
                    strokeWidth={2}
                  />
                  {favorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => archiveNote.mutate(noteId)}>
                  <HugeiconsIcon
                    className="mr-2 size-4"
                    icon={ArchiveIcon}
                    strokeWidth={2}
                  />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <HugeiconsIcon
                    className="mr-2 size-4"
                    icon={Delete01Icon}
                    strokeWidth={2}
                  />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AlertDialog onOpenChange={setConfirmDelete} open={confirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteNote.mutate(noteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
