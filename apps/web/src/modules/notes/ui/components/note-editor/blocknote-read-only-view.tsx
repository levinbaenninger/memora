"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "./blocknote-overrides.css";

import type { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useEffect, useState, useSyncExternalStore } from "react";

import { useTheme } from "@memora/ui/components/theme-provider";
import { cn } from "@memora/ui/lib/utils";

import { noteSchema } from "./blocknote-schema";

interface Props {
  className?: string;
  content: PartialBlock[] | undefined;
}

const subscribeNoop = () => () => {
  // no-op
};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function BlockNoteReadOnlyView(props: Props) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) {
    return <div className={cn("min-h-[200px]", props.className)} />;
  }

  return <Inner {...props} />;
}

function Inner({ className, content }: Props) {
  const editor = useCreateBlockNote({
    schema: noteSchema,
    initialContent: content && content.length > 0 ? content : undefined,
  });

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

  return (
    <BlockNoteView
      className={cn("memora-blocknote", className)}
      editable={false}
      editor={editor}
      formattingToolbar={false}
      sideMenu={false}
      slashMenu={false}
      theme={resolvedTheme}
    />
  );
}
