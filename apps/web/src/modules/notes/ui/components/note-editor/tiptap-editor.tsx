"use client";

import { useRouter } from "@tanstack/react-router";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import {
  type Editor,
  EditorContent,
  type JSONContent,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect } from "react";

import { cn } from "@memora/ui/lib/utils";

import { INTERNAL_NOTE_HREF_RE } from "./internal-link-re";

export function createEditorExtensions() {
  return [
    StarterKit,
    Link.configure({
      protocols: ["memora"],
      openOnClick: false,
      autolink: false,
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
  ];
}

interface TipTapEditorProps {
  className?: string;
  editor: Editor | null;
}

export function TipTapEditor({ editor, className }: TipTapEditorProps) {
  return (
    <EditorContent
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "[&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:overflow-x-hidden [&_.ProseMirror]:break-words [&_.ProseMirror]:px-6 [&_.ProseMirror]:py-4 [&_.ProseMirror]:outline-none",
        "[&_.ProseMirror_a]:cursor-pointer [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline",
        "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']_li]:flex [&_ul[data-type='taskList']_li]:items-start [&_ul[data-type='taskList']_li]:gap-2",
        "[&_ul[data-type='taskList']_li_>_label]:mt-0.5",
        !editor?.isEditable && "opacity-60",
        className
      )}
      editor={editor}
    />
  );
}

export function useNoteEditor({
  content,
  editable,
  onUpdate,
  noteId,
}: {
  content: JSONContent;
  editable: boolean;
  onUpdate: (content: JSONContent) => void;
  noteId: string;
}) {
  const router = useRouter();

  const handleLinkClick = useCallback(
    (href: string) => {
      const match = INTERNAL_NOTE_HREF_RE.exec(href);
      if (match?.[1]) {
        router.navigate({
          to: "/notes/$noteId",
          params: { noteId: match[1] },
          search: (prev) => ({ ...prev, view: prev.view ?? "all" }),
        });
        return true;
      }
      return false;
    },
    [router]
  );

  const editor = useEditor({
    extensions: createEditorExtensions(),
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getJSON());
    },
    editorProps: {
      handleClickOn: (_view, _pos, _node, _nodePos, event) => {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a") as HTMLAnchorElement | null;
        if (anchor?.href) {
          return handleLinkClick(anchor.href);
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset content only when switching notes
  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.commands.setContent(content, { emitUpdate: false });
  }, [noteId]);

  return editor;
}
