"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type CommandMenuPage =
  | "root"
  | "new-folder"
  | "new-tag"
  | "rename-folder"
  | "rename-tag"
  | "delete-folder"
  | "delete-tag"
  | "move-to-folder"
  | "add-tag";

interface CommandMenuContextValue {
  open: boolean;
  page: CommandMenuPage;
  query: string;
  setOpen: (open: boolean) => void;
  setPage: (page: CommandMenuPage) => void;
  setQuery: (query: string) => void;
  toggle: () => void;
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<CommandMenuPage>("root");
  const [query, setQuery] = useState("");
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, page, setPage, query, setQuery }),
    [open, toggle, page, query]
  );

  return (
    <CommandMenuContext.Provider value={value}>
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenu() {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) {
    throw new Error("useCommandMenu must be used within a CommandMenuProvider");
  }
  return ctx;
}
