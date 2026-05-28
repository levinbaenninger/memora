import { Delete01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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

import { useDeleteTag, useUpdateTag } from "@/modules/notes/mutations";
import { useTagsList } from "@/modules/notes/queries";

export function TagList() {
  const { data: tags } = useTagsList();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const deleteTag = useDeleteTag();
  const updateTag = useUpdateTag();
  const [tagToDelete, setTagToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [tagToRename, setTagToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const commitRename = () => {
    if (
      tagToRename &&
      renameValue.trim() &&
      renameValue.trim() !== tagToRename.name
    ) {
      updateTag.mutate({ id: tagToRename.id, name: renameValue.trim() });
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
            const tagPath = `/notes/tag/${tag.id}`;
            const isActive = pathname === tagPath;
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
                      isActive={isActive}
                      onClick={() =>
                        isActive
                          ? navigate({ to: "/notes" })
                          : navigate({
                              to: "/notes/tag/$tagId",
                              params: { tagId: tag.id },
                            })
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
                        setTagToRename({ id: tag.id, name: tag.name });
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
                      onClick={() =>
                        setTagToDelete({ id: tag.id, name: tag.name })
                      }
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

      <AlertDialog
        onOpenChange={(open) => !open && setTagToRename(null)}
        open={!!tagToRename}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename tag</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitRename();
              }
            }}
            placeholder="Tag name"
            value={renameValue}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                !renameValue.trim() || renameValue.trim() === tagToRename?.name
              }
              onClick={commitRename}
            >
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              This tag will be removed from all notes. Notes are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (tagToDelete) {
                  if (pathname === `/notes/tag/${tagToDelete.id}`) {
                    navigate({ to: "/notes" });
                  }
                  deleteTag.mutate(tagToDelete.id);
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
