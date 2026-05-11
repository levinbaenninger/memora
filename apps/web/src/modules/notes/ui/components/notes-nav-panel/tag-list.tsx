import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
  ContextMenuTrigger,
} from "@memora/ui/components/context-menu";
import {
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@memora/ui/components/sidebar";
import { Skeleton } from "@memora/ui/components/skeleton";
import { cn } from "@memora/ui/lib/utils";

import { useDeleteTag } from "@/modules/notes/mutations";
import { useTagsList } from "@/modules/notes/queries";

export function TagList() {
  const { data: tags, isPending } = useTagsList();
  const navigate = useNavigate({ from: "/notes" });
  const search = useSearch({ from: "/_app/notes" });
  const deleteTag = useDeleteTag();
  const [tagToDelete, setTagToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (!(isPending || tags?.length)) {
    return null;
  }

  return (
    <>
      <div>
        <SidebarGroupLabel>Tags</SidebarGroupLabel>
        <SidebarMenuSub>
          {isPending ? (
            <>
              <SidebarMenuSubItem>
                <Skeleton className="h-6 w-full rounded-md" />
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <Skeleton className="h-6 w-2/3 rounded-md" />
              </SidebarMenuSubItem>
            </>
          ) : (
            tags?.map((tag) => {
              const isActive = search.tag === tag.id;
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
                          navigate({
                            search: (prev) => ({
                              ...prev,
                              tag: prev.tag === tag.id ? undefined : tag.id,
                              folder: undefined,
                            }),
                          })
                        }
                      >
                        <span className="text-muted-foreground">#</span>
                        <span className="truncate">{tag.name}</span>
                      </SidebarMenuSubButton>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
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
            })
          )}
        </SidebarMenuSub>
      </div>

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
                  if (search.tag === tagToDelete.id) {
                    navigate({
                      search: (prev) => ({ ...prev, tag: undefined }),
                    });
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
