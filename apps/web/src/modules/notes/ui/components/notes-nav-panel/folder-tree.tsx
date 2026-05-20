import {
  Add01Icon,
  ArchiveIcon,
  ArrowRight01Icon,
  Delete01Icon,
  Edit01Icon,
  FolderIcon,
  FolderOpenIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useLocation, useNavigate } from "@tanstack/react-router";
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
import { Button } from "@memora/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@memora/ui/components/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@memora/ui/components/context-menu";
import { Input } from "@memora/ui/components/input";
import {
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@memora/ui/components/sidebar";
import { cn } from "@memora/ui/lib/utils";

import {
  useArchiveFolder,
  useCreateFolder,
  useDeleteFolder,
  useUpdateFolder,
} from "@/modules/notes/mutations";
import { useFoldersList } from "@/modules/notes/queries";
import { useNotesStore } from "@/modules/notes/store";

interface FolderNode {
  children: FolderNode[];
  id: string;
  name: string;
  parentId: string | null;
}

function buildFolderTree(
  folders: { id: string; name: string; parentId: string | null }[]
): FolderNode[] {
  const map = new Map<string, FolderNode>();
  for (const f of folders) {
    map.set(f.id, { ...f, children: [] });
  }
  const roots: FolderNode[] = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function InlineFolderForm({
  parentId,
  onDone,
}: {
  parentId?: string | null;
  onDone: () => void;
}) {
  const createFolder = useCreateFolder();

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) {
        onDone();
        return;
      }
      await createFolder.mutateAsync({
        name: value.name.trim(),
        parentId: parentId ?? undefined,
      });
      onDone();
    },
  });

  return (
    <div className="px-1 py-0.5">
      <form.Field name="name">
        {(field) => (
          <Input
            className="h-6 text-xs"
            onBlur={() => {
              if (field.state.value.trim()) {
                form.handleSubmit();
              } else {
                onDone();
              }
            }}
            onChange={(e) => field.handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                form.handleSubmit();
              } else if (e.key === "Escape") {
                onDone();
              }
            }}
            placeholder="Folder name"
            value={field.state.value}
          />
        )}
      </form.Field>
    </div>
  );
}

function RenameFolderForm({
  folder,
  onDone,
}: {
  folder: FolderNode;
  onDone: () => void;
}) {
  const updateFolder = useUpdateFolder();

  const form = useForm({
    defaultValues: { name: folder.name },
    onSubmit: async ({ value }) => {
      if (!value.name.trim() || value.name.trim() === folder.name) {
        onDone();
        return;
      }
      await updateFolder.mutateAsync({
        id: folder.id,
        name: value.name.trim(),
      });
      onDone();
    },
  });

  return (
    <div className="flex-1">
      <form.Field name="name">
        {(field) => (
          <Input
            className="h-6 text-xs"
            onBlur={() => form.handleSubmit()}
            onChange={(e) => field.handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                form.handleSubmit();
              } else if (e.key === "Escape") {
                onDone();
              }
            }}
            value={field.state.value}
          />
        )}
      </form.Field>
    </div>
  );
}

function FolderRow({ folder }: { folder: FolderNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { expandedFolderIds, toggleFolder, expandFolder } = useNotesStore();
  const archiveFolder = useArchiveFolder();
  const deleteFolder = useDeleteFolder();

  const [isRenaming, setIsRenaming] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const folderPath = `/notes/folder/${folder.id}`;
  const isExpanded = expandedFolderIds.has(folder.id);
  const isActive = pathname === folderPath;
  const hasChildren = folder.children.length > 0 || isCreatingChild;

  const handleNavigate = () => {
    navigate({
      to: "/notes/folder/$folderId",
      params: { folderId: folder.id },
    });
  };

  return (
    <>
      <SidebarMenuSubItem>
        <ContextMenu>
          <ContextMenuTrigger
            render={(props) => (
              <div {...props} className={cn("block", props.className)} />
            )}
          >
            <SidebarMenuSubButton
              isActive={isActive}
              onClick={() => {
                handleNavigate();
                if (hasChildren) {
                  toggleFolder(folder.id);
                }
              }}
            >
              <HugeiconsIcon
                className="size-3.5 shrink-0"
                icon={isExpanded && hasChildren ? FolderOpenIcon : FolderIcon}
                strokeWidth={1.5}
              />
              {isRenaming ? (
                <RenameFolderForm
                  folder={folder}
                  onDone={() => setIsRenaming(false)}
                />
              ) : (
                <span className="flex-1 truncate">{folder.name}</span>
              )}
              {hasChildren && (
                <HugeiconsIcon
                  className={cn(
                    "ml-auto size-3 shrink-0 transition-transform duration-150",
                    isExpanded && "rotate-90"
                  )}
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                />
              )}
            </SidebarMenuSubButton>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onClick={() => setIsRenaming(true)}>
              <HugeiconsIcon
                className="size-4"
                icon={Edit01Icon}
                strokeWidth={2}
              />
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                expandFolder(folder.id);
                setIsCreatingChild(true);
              }}
            >
              <HugeiconsIcon
                className="size-4"
                icon={Add01Icon}
                strokeWidth={2}
              />
              New subfolder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                archiveFolder.mutate(folder.id);
                if (isActive) {
                  navigate({ to: "/notes" });
                }
              }}
            >
              <HugeiconsIcon
                className="size-4"
                icon={ArchiveIcon}
                strokeWidth={2}
              />
              Archive
            </ContextMenuItem>
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
      </SidebarMenuSubItem>

      {hasChildren && (
        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <SidebarMenuSub>
              {folder.children.map((child) => (
                <FolderRow folder={child} key={child.id} />
              ))}
              {isCreatingChild && (
                <SidebarMenuSubItem>
                  <InlineFolderForm
                    onDone={() => setIsCreatingChild(false)}
                    parentId={folder.id}
                  />
                </SidebarMenuSubItem>
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      )}

      <AlertDialog onOpenChange={setConfirmDelete} open={confirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              The folder and all its notes will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (isActive) {
                  navigate({ to: "/notes" });
                }
                deleteFolder.mutate(folder.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function FolderTree() {
  const { data: folders } = useFoldersList();
  const [isCreating, setIsCreating] = useState(false);
  const tree = buildFolderTree(folders);

  return (
    <div>
      <div className="flex items-center justify-between pr-1">
        <SidebarGroupLabel>Folders</SidebarGroupLabel>
        <Button
          className="size-5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={() => setIsCreating(true)}
          size="icon"
          variant="ghost"
        >
          <HugeiconsIcon
            className="size-3"
            icon={PlusSignIcon}
            strokeWidth={2}
          />
        </Button>
      </div>
      <SidebarMenuSub>
        {!isCreating && tree.length === 0 && (
          <SidebarMenuSubItem>
            <span className="px-2 py-1 text-sidebar-foreground/50 text-xs">
              No folders yet
            </span>
          </SidebarMenuSubItem>
        )}
        {tree.map((folder) => (
          <FolderRow folder={folder} key={folder.id} />
        ))}
        {isCreating && (
          <SidebarMenuSubItem>
            <InlineFolderForm onDone={() => setIsCreating(false)} />
          </SidebarMenuSubItem>
        )}
      </SidebarMenuSub>
    </div>
  );
}
