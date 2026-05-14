import { Add01Icon, NoteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearch } from "@tanstack/react-router";

import { Button } from "@memora/ui/components/button";

import { useCreateNote } from "@/modules/notes/mutations";

export function NotesEmptyView() {
  const search = useSearch({ from: "/_app/notes" });
  const createNote = useCreateNote();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <HugeiconsIcon
          className="size-8 text-muted-foreground"
          icon={NoteIcon}
          strokeWidth={1.5}
        />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-sm">No note selected</p>
        <p className="text-muted-foreground text-xs">
          Select a note from the list or create a new one
        </p>
      </div>
      <Button
        className="gap-2"
        disabled={createNote.isPending}
        onClick={() =>
          createNote.mutate({
            title: "Untitled",
            content: [],
            folderId: search.folder ?? undefined,
          })
        }
        size="sm"
      >
        <HugeiconsIcon className="size-4" icon={Add01Icon} strokeWidth={2} />
        New Note
      </Button>
    </div>
  );
}
