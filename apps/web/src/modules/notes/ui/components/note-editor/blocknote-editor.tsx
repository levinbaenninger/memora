"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./blocknote-overrides.css";

import { filterSuggestionItems, type PartialBlock } from "@blocknote/core";
import {
  type DefaultReactSuggestionItem,
  DragHandleMenu,
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  type SideMenuProps,
  SuggestionMenuController,
  useBlockNoteEditor,
  useCreateBlockNote,
  useEditorState,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { offset } from "@floating-ui/react";
import { Delete01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useTheme } from "@memora/ui/components/theme-provider";
import { cn } from "@memora/ui/lib/utils";

import { noteSchema } from "./blocknote-schema";
import { LinkNoteDialog } from "./link-note-dialog";

const HIDE_TOOLBAR_BLOCK_TYPES = new Set(["divider"]);

function GatedFormattingToolbar() {
  const editor = useBlockNoteEditor();
  const blockType = useEditorState({
    editor,
    selector: ({ editor: e }) => e.getTextCursorPosition().block.type,
  });

  if (HIDE_TOOLBAR_BLOCK_TYPES.has(blockType)) {
    return null;
  }
  return <FormattingToolbar />;
}

const CustomDragHandleMenu = () => (
  <DragHandleMenu>
    <RemoveBlockItem>
      <span className="memora-delete-item">
        <HugeiconsIcon icon={Delete01Icon} size={14} strokeWidth={2} />
        Delete
      </span>
    </RemoveBlockItem>
  </DragHandleMenu>
);

const CustomSideMenu = (props: SideMenuProps) => (
  <SideMenu {...props} dragHandleMenu={CustomDragHandleMenu} />
);

interface BlockNoteEditorViewProps {
  className?: string;
  content: PartialBlock[] | undefined;
  editable: boolean;
  noteId: string;
  onUpdate: (blocks: PartialBlock[]) => void;
}

const subscribeNoop = () => {
  return () => {
    // no-op: client/server snapshot never changes after hydration
  };
};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function BlockNoteEditorView(props: BlockNoteEditorViewProps) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) {
    return <div className={cn("min-h-[200px]", props.className)} />;
  }

  return <ClientBlockNoteEditor {...props} />;
}

function ClientBlockNoteEditor({
  className,
  content,
  editable,
  noteId,
  onUpdate,
}: BlockNoteEditorViewProps) {
  const initialContentRef = useRef(
    content && content.length > 0 ? content : undefined
  );
  const editor = useCreateBlockNote({
    schema: noteSchema,
    initialContent: initialContentRef.current,
  });

  const [linkNoteOpen, setLinkNoteOpen] = useState(false);
  const previousNoteIdRef = useRef(noteId);
  const { theme } = useTheme();
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  let resolvedTheme: "light" | "dark" = "light";
  if (theme === "dark") {
    resolvedTheme = "dark";
  } else if (theme === "system" && systemDark) {
    resolvedTheme = "dark";
  }

  useEffect(() => {
    if (previousNoteIdRef.current === noteId) {
      return;
    }
    previousNoteIdRef.current = noteId;
    const next =
      content && content.length > 0
        ? content
        : [{ type: "paragraph" } as PartialBlock];
    editor.replaceBlocks(editor.document, next as never);
  }, [content, editor, noteId]);

  const persistEditorContent = useCallback(() => {
    onUpdate(editor.document as PartialBlock[]);
  }, [editor, onUpdate]);

  const getSlashItems = useCallback(
    (query: string) => {
      const linkNote: DefaultReactSuggestionItem = {
        title: "Link note",
        subtext: "Reference another note",
        aliases: ["mention", "ref", "@", "internal"],
        group: "Other",
        icon: <HugeiconsIcon icon={Link01Icon} size={18} strokeWidth={1.5} />,
        onItemClick: () => {
          setLinkNoteOpen(true);
        },
      };

      const all = [...getDefaultReactSlashMenuItems(editor), linkNote];

      return filterSuggestionItems(all, query);
    },
    [editor]
  );

  const handleSelectNote = useCallback(
    (note: { id: string; title: string }) => {
      editor.insertInlineContent([
        {
          type: "noteMention",
          props: {
            noteId: note.id,
            label: note.title || "Untitled",
          },
        },
        " ",
      ]);
      setLinkNoteOpen(false);
    },
    [editor]
  );

  return (
    <>
      <BlockNoteView
        className={cn("memora-blocknote", className)}
        editable={editable}
        editor={editor}
        formattingToolbar={false}
        onChange={persistEditorContent}
        sideMenu={false}
        slashMenu={false}
        theme={resolvedTheme}
      >
        <FormattingToolbarController
          formattingToolbar={GatedFormattingToolbar}
        />
        <SuggestionMenuController
          getItems={(query) => Promise.resolve(getSlashItems(query))}
          triggerCharacter="/"
        />
        <SideMenuController
          floatingUIOptions={{
            useFloatingOptions: {
              middleware: [offset(12)],
            },
          }}
          sideMenu={CustomSideMenu}
        />
      </BlockNoteView>

      <LinkNoteDialog
        excludeNoteId={noteId}
        onOpenChange={setLinkNoteOpen}
        onSelect={handleSelectNote}
        open={linkNoteOpen}
      />
    </>
  );
}
