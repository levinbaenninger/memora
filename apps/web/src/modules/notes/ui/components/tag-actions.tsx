import { Delete01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useState } from "react";

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
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@memora/ui/components/dropdown-menu";
import { Input } from "@memora/ui/components/input";

import { useDeleteTag, useUpdateTag } from "@/modules/notes/mutations";

interface TagActionsContextValue {
  openDelete: () => void;
  openRename: () => void;
}

const TagActionsContext = createContext<TagActionsContextValue | null>(null);

function useTagActions() {
  const ctx = use(TagActionsContext);
  if (!ctx) {
    throw new Error("useTagActions must be used within TagActionsProvider");
  }
  return ctx;
}

interface TagActionsProviderProps {
  children: ReactNode;
  tagId: string;
  tagName: string;
}

export function TagActionsProvider({
  children,
  tagId,
  tagName,
}: TagActionsProviderProps) {
  const navigate = useNavigate();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const value: TagActionsContextValue = {
    openRename: () => {
      setNewName(tagName);
      setRenameOpen(true);
    },
    openDelete: () => setConfirmDelete(true),
  };

  return (
    <TagActionsContext.Provider value={value}>
      {children}

      <AlertDialog onOpenChange={setRenameOpen} open={renameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename tag</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                updateTag.mutate({ id: tagId, name: newName.trim() });
                setRenameOpen(false);
              }
            }}
            placeholder="Tag name"
            value={newName}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!newName.trim() || newName.trim() === tagName}
              onClick={() => {
                if (newName.trim() && newName.trim() !== tagName) {
                  updateTag.mutate({ id: tagId, name: newName.trim() });
                  setRenameOpen(false);
                }
              }}
            >
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setConfirmDelete} open={confirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag "{tagName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This tag will be removed from all notes. Notes are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteTag.mutate(tagId);
                setConfirmDelete(false);
                navigate({ to: "/notes" });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TagActionsContext.Provider>
  );
}

export function TagMenuItems() {
  const actions = useTagActions();

  return (
    <>
      <DropdownMenuItem onClick={actions.openRename}>
        <HugeiconsIcon className="size-4" icon={Edit01Icon} strokeWidth={2} />
        Rename
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={actions.openDelete} variant="destructive">
        <HugeiconsIcon className="size-4" icon={Delete01Icon} strokeWidth={2} />
        Delete
      </DropdownMenuItem>
    </>
  );
}
