import { Delete01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
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
import { Button } from "@memora/ui/components/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@memora/ui/components/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@memora/ui/components/dialog";
import { Input } from "@memora/ui/components/input";
import {
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@memora/ui/components/sidebar";
import { cn } from "@memora/ui/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TagNavListProps {
  entityName: string;
  isActive: (tagId: string) => boolean;
  onDelete: (tag: Tag) => void;
  onNavigateHome: () => void;
  onNavigateToTag: (tagId: string) => void;
  onRename: (id: string, name: string) => void;
  tags: Tag[];
}

export function TagNavList({
  entityName,
  isActive,
  onDelete,
  onNavigateHome,
  onNavigateToTag,
  onRename,
  tags,
}: TagNavListProps) {
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [tagToRename, setTagToRename] = useState<Tag | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const commitRename = () => {
    if (
      tagToRename &&
      renameValue.trim() &&
      renameValue.trim() !== tagToRename.name
    ) {
      onRename(tagToRename.id, renameValue.trim());
    }
    setTagToRename(null);
  };

  return (
    <>
      <div>
        <SidebarGroupLabel>Tags</SidebarGroupLabel>
        <SidebarMenuSub>
          {tags.length === 0 && (
            <SidebarMenuSubItem>
              <span className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                No tags yet
              </span>
            </SidebarMenuSubItem>
          )}
          {tags.map((tag) => {
            const active = isActive(tag.id);
            return (
              <SidebarMenuSubItem key={tag.id}>
                <ContextMenu>
                  <ContextMenuTrigger
                    render={(props) => (
                      <div
                        {...props}
                        className={cn("block", props.className)}
                      />
                    )}
                  >
                    <SidebarMenuSubButton
                      isActive={active}
                      onClick={() =>
                        active ? onNavigateHome() : onNavigateToTag(tag.id)
                      }
                    >
                      <span className="text-muted-foreground">#</span>
                      <span className="truncate">{tag.name}</span>
                    </SidebarMenuSubButton>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setRenameValue(tag.name);
                        setTagToRename(tag);
                      }}
                    >
                      <HugeiconsIcon
                        className="size-4"
                        icon={Edit01Icon}
                        strokeWidth={2}
                      />
                      Rename
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => setTagToDelete(tag)}
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
            );
          })}
        </SidebarMenuSub>
      </div>

      <Dialog
        onOpenChange={(open) => !open && setTagToRename(null)}
        open={!!tagToRename}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename tag</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitRename();
              }
            }}
            placeholder="Tag name"
            value={renameValue}
          />
          <DialogFooter>
            <Button
              onClick={() => setTagToRename(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={
                !renameValue.trim() || renameValue.trim() === tagToRename?.name
              }
              onClick={commitRename}
              type="button"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => !open && setTagToDelete(null)}
        open={!!tagToDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete tag "#{tagToDelete?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This tag will be removed from all {entityName}.{" "}
              {entityName.charAt(0).toUpperCase() + entityName.slice(1)} are not
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (tagToDelete) {
                  onDelete(tagToDelete);
                }
                setTagToDelete(null);
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
