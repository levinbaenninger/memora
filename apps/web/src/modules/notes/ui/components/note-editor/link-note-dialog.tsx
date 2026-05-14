"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@memora/ui/components/command";

import { orpc } from "@/utils/orpc";

interface LinkNoteDialogProps {
  excludeNoteId?: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (note: { id: string; title: string }) => void;
  open: boolean;
}

export function LinkNoteDialog({
  open,
  onOpenChange,
  excludeNoteId,
  onSelect,
}: LinkNoteDialogProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;

  const searchQuery = useQuery({
    ...orpc.notes.search.queryOptions({
      input: {
        query: trimmed,
        includeArchived: false,
        limit: 20,
        offset: 0,
      },
    }),
    enabled: open && hasQuery,
  });

  const listQuery = useQuery({
    ...orpc.notes.list.queryOptions({
      input: { includeArchived: false, limit: 20, offset: 0 },
    }),
    enabled: open && !hasQuery,
  });

  const raw = hasQuery ? searchQuery.data : listQuery.data;
  const notes = (raw ?? []).filter((n) => n.id !== excludeNoteId);

  return (
    <CommandDialog
      description="Search notes to link"
      onOpenChange={onOpenChange}
      open={open}
      title="Link a note"
    >
      <Command shouldFilter={false}>
        <CommandInput
          onValueChange={setQuery}
          placeholder="Search notes to link…"
          value={query}
        />
        <CommandList>
          <CommandEmpty>No notes found</CommandEmpty>
          <CommandGroup>
            {notes.map((note) => (
              <CommandItem
                key={note.id}
                onSelect={() => onSelect({ id: note.id, title: note.title })}
                value={note.id}
              >
                <span className="truncate">{note.title || "Untitled"}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
