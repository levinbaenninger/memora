import {
  ArchiveIcon,
  Delete01Icon,
  Edit01Icon,
  FolderAddIcon,
} from "@hugeicons/core-free-icons";
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

import {
  useArchiveFolder,
  useCreateFolder,
  useDeleteFolder,
  useUpdateFolder,
} from "@/modules/notes/mutations";

interface FolderActionsContextValue {
  openArchive: () => void;
  openDelete: () => void;
  openRename: () => void;
  openSubfolder: () => void;
}

const FolderActionsContext = createContext<FolderActionsContextValue | null>(
  null
);

function useFolderActions() {
  const ctx = use(FolderActionsContext);
  if (!ctx) {
    throw new Error(
      "useFolderActions must be used within FolderActionsProvider"
    );
  }
  return ctx;
}

interface FolderActionsProviderProps {
  children: ReactNode;
  folderId: string;
  folderName: string;
}

export function FolderActionsProvider({
  children,
  folderId,
  folderName,
}: FolderActionsProviderProps) {
  const navigate = useNavigate();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const archiveFolder = useArchiveFolder();
  const deleteFolder = useDeleteFolder();

  const [subfolderOpen, setSubfolderOpen] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const value: FolderActionsContextValue = {
    openSubfolder: () => {
      setSubfolderName("");
      setSubfolderOpen(true);
    },
    openRename: () => {
      setNewName(folderName);
      setRenameOpen(true);
    },
    openArchive: () => setConfirmArchive(true),
    openDelete: () => setConfirmDelete(true),
  };

  return (
    <FolderActionsContext.Provider value={value}>
      {children}

      <AlertDialog onOpenChange={setSubfolderOpen} open={subfolderOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New subfolder</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            onChange={(e) => setSubfolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && subfolderName.trim()) {
                createFolder.mutate({
                  name: subfolderName.trim(),
                  parentId: folderId,
                });
                setSubfolderOpen(false);
              }
            }}
            placeholder="Folder name"
            value={subfolderName}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!subfolderName.trim()}
              onClick={() => {
                if (subfolderName.trim()) {
                  createFolder.mutate({
                    name: subfolderName.trim(),
                    parentId: folderId,
                  });
                  setSubfolderOpen(false);
                }
              }}
            >
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setRenameOpen} open={renameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename folder</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                updateFolder.mutate({ id: folderId, name: newName.trim() });
                setRenameOpen(false);
              }
            }}
            placeholder="Folder name"
            value={newName}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!newName.trim() || newName.trim() === folderName}
              onClick={() => {
                if (newName.trim() && newName.trim() !== folderName) {
                  updateFolder.mutate({ id: folderId, name: newName.trim() });
                  setRenameOpen(false);
                }
              }}
            >
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setConfirmArchive} open={confirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive "{folderName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Notes inside stay intact. The folder is hidden from active views.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                archiveFolder.mutate(folderId, {
                  onSuccess: () => {
                    setConfirmArchive(false);
                    navigate({ to: "/notes" });
                  },
                });
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setConfirmDelete} open={confirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{folderName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              The folder and all its notes will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteFolder.mutate(folderId, {
                  onSuccess: () => {
                    setConfirmDelete(false);
                    navigate({ to: "/notes" });
                  },
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FolderActionsContext.Provider>
  );
}

export function FolderMenuItems() {
  const actions = useFolderActions();

  return (
    <>
      <DropdownMenuItem onClick={actions.openSubfolder}>
        <HugeiconsIcon
          className="size-4"
          icon={FolderAddIcon}
          strokeWidth={2}
        />
        New subfolder
      </DropdownMenuItem>
      <DropdownMenuItem onClick={actions.openRename}>
        <HugeiconsIcon className="size-4" icon={Edit01Icon} strokeWidth={2} />
        Rename
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={actions.openArchive}>
        <HugeiconsIcon className="size-4" icon={ArchiveIcon} strokeWidth={2} />
        Archive
      </DropdownMenuItem>
      <DropdownMenuItem onClick={actions.openDelete} variant="destructive">
        <HugeiconsIcon className="size-4" icon={Delete01Icon} strokeWidth={2} />
        Delete
      </DropdownMenuItem>
    </>
  );
}
