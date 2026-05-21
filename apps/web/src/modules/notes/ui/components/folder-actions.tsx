import {
  ArchiveIcon,
  Delete01Icon,
  Edit01Icon,
  FolderAddIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useReducer } from "react";

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

interface FolderActionsState {
  confirmArchive: boolean;
  confirmDelete: boolean;
  rename: { open: boolean; name: string };
  subfolder: { open: boolean; name: string };
}

type FolderActionsAction =
  | { type: "openSubfolder" }
  | { type: "setSubfolderName"; value: string }
  | { type: "closeSubfolder" }
  | { type: "openRename"; name: string }
  | { type: "setRenameName"; value: string }
  | { type: "closeRename" }
  | { type: "openArchive" }
  | { type: "closeArchive" }
  | { type: "openDelete" }
  | { type: "closeDelete" };

const initialFolderActionsState: FolderActionsState = {
  subfolder: { open: false, name: "" },
  rename: { open: false, name: "" },
  confirmArchive: false,
  confirmDelete: false,
};

function folderActionsReducer(
  state: FolderActionsState,
  action: FolderActionsAction
): FolderActionsState {
  switch (action.type) {
    case "openSubfolder":
      return { ...state, subfolder: { open: true, name: "" } };
    case "setSubfolderName":
      return {
        ...state,
        subfolder: { ...state.subfolder, name: action.value },
      };
    case "closeSubfolder":
      return { ...state, subfolder: { ...state.subfolder, open: false } };
    case "openRename":
      return { ...state, rename: { open: true, name: action.name } };
    case "setRenameName":
      return { ...state, rename: { ...state.rename, name: action.value } };
    case "closeRename":
      return { ...state, rename: { ...state.rename, open: false } };
    case "openArchive":
      return { ...state, confirmArchive: true };
    case "closeArchive":
      return { ...state, confirmArchive: false };
    case "openDelete":
      return { ...state, confirmDelete: true };
    case "closeDelete":
      return { ...state, confirmDelete: false };
    default:
      return state;
  }
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

  const [state, dispatch] = useReducer(
    folderActionsReducer,
    initialFolderActionsState
  );

  const value: FolderActionsContextValue = {
    openSubfolder: () => dispatch({ type: "openSubfolder" }),
    openRename: () => dispatch({ type: "openRename", name: folderName }),
    openArchive: () => dispatch({ type: "openArchive" }),
    openDelete: () => dispatch({ type: "openDelete" }),
  };

  const subfolderName = state.subfolder.name;
  const newName = state.rename.name;

  return (
    <FolderActionsContext.Provider value={value}>
      {children}

      <AlertDialog
        onOpenChange={(open) =>
          dispatch({ type: open ? "openSubfolder" : "closeSubfolder" })
        }
        open={state.subfolder.open}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New subfolder</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            onChange={(e) =>
              dispatch({ type: "setSubfolderName", value: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && subfolderName.trim()) {
                createFolder.mutate({
                  name: subfolderName.trim(),
                  parentId: folderId,
                });
                dispatch({ type: "closeSubfolder" });
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
                  dispatch({ type: "closeSubfolder" });
                }
              }}
            >
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) =>
          dispatch(
            open
              ? { type: "openRename", name: folderName }
              : { type: "closeRename" }
          )
        }
        open={state.rename.open}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename folder</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            onChange={(e) =>
              dispatch({ type: "setRenameName", value: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                updateFolder.mutate({ id: folderId, name: newName.trim() });
                dispatch({ type: "closeRename" });
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
                  dispatch({ type: "closeRename" });
                }
              }}
            >
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) =>
          dispatch({ type: open ? "openArchive" : "closeArchive" })
        }
        open={state.confirmArchive}
      >
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
                    dispatch({ type: "closeArchive" });
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

      <AlertDialog
        onOpenChange={(open) =>
          dispatch({ type: open ? "openDelete" : "closeDelete" })
        }
        open={state.confirmDelete}
      >
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
                    dispatch({ type: "closeDelete" });
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
