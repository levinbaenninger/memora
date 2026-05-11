"use client";

import {
  ArchiveIcon,
  CheckListIcon,
  CodeIcon,
  Delete01Icon,
  FavouriteIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  MoreHorizontalIcon,
  PinIcon,
  PinOffIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Editor } from "@tiptap/react";
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
import { Button, buttonVariants } from "@memora/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@memora/ui/components/dropdown-menu";
import { Input } from "@memora/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@memora/ui/components/popover";
import { cn } from "@memora/ui/lib/utils";

import {
  useArchiveNote,
  useDeleteNote,
  useUpdateNote,
} from "@/modules/notes/mutations";
import type { SaveStatus } from "@/modules/notes/store";
import { useNotesStore } from "@/modules/notes/store";

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  onClick: () => void;
}

function ToolbarButton({
  active,
  disabled,
  icon,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Button
      className={cn("size-7", active && "bg-accent text-accent-foreground")}
      disabled={disabled}
      onClick={onClick}
      size="icon"
      title={label}
      variant="ghost"
    >
      <HugeiconsIcon className="size-3.5" icon={icon} strokeWidth={2} />
    </Button>
  );
}

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

interface LinkPopoverProps {
  editor: Editor;
}

function LinkPopover({ editor }: LinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleInsert = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
    setUrl("");
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        title="Insert link"
      >
        <HugeiconsIcon className="size-3.5" icon={Link01Icon} strokeWidth={2} />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="flex gap-2">
          <Input
            autoFocus
            className="h-8 text-sm"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInsert();
              }
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="https://… or memora://note/…"
            value={url}
          />
          <Button className="h-8 px-3" onClick={handleInsert} size="sm">
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
  favorite: boolean;
  noteId: string;
  pinned: boolean;
}

export function EditorToolbar({
  editor,
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
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-0.5 px-3 py-2">
          {editor && (
            <>
              <ToolbarButton
                active={editor.isActive("bold")}
                icon={TextBoldIcon}
                label="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                active={editor.isActive("italic")}
                icon={TextItalicIcon}
                label="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
              <ToolbarButton
                active={editor.isActive("strike")}
                icon={TextStrikethroughIcon}
                label="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
              />
              <ToolbarButton
                active={editor.isActive("code")}
                icon={CodeIcon}
                label="Inline code"
                onClick={() => editor.chain().focus().toggleCode().run()}
              />

              <div className="mx-1 h-4 w-px shrink-0 self-center bg-border" />

              <ToolbarButton
                active={editor.isActive("heading", { level: 1 })}
                icon={Heading01Icon}
                label="Heading 1"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              />
              <ToolbarButton
                active={editor.isActive("heading", { level: 2 })}
                icon={Heading02Icon}
                label="Heading 2"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              />
              <ToolbarButton
                active={editor.isActive("heading", { level: 3 })}
                icon={Heading03Icon}
                label="Heading 3"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              />

              <div className="mx-1 h-4 w-px shrink-0 self-center bg-border" />

              <ToolbarButton
                active={editor.isActive("bulletList")}
                icon={LeftToRightListBulletIcon}
                label="Bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
              <ToolbarButton
                active={editor.isActive("orderedList")}
                icon={LeftToRightListNumberIcon}
                label="Ordered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
              <ToolbarButton
                active={editor.isActive("taskList")}
                icon={CheckListIcon}
                label="Task list"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
              />

              <div className="mx-1 h-4 w-px shrink-0 self-center bg-border" />

              <LinkPopover editor={editor} />

              <div className="mx-1 h-4 w-px shrink-0 self-center bg-border" />
            </>
          )}

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
