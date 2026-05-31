import { NoteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

import { useCreateNote } from "@/modules/notes/mutations";
import { notesListInput } from "@/modules/notes/queries";
import { orpc } from "@/utils/orpc";
import { DashboardCard } from "./dashboard-card";

export function RecentNotes() {
  const { data: notes } = useSuspenseQuery(
    orpc.notes.list.queryOptions({
      input: notesListInput({ view: "all", limit: 5 }),
    })
  );
  const createNote = useCreateNote();

  const handleCreate = () => {
    createNote.mutate({ title: "Untitled", content: [] });
  };

  return (
    <DashboardCard
      addLabel="New note"
      onAdd={handleCreate}
      title="Recently edited"
    >
      {notes.length === 0 ? (
        <p className="py-4 text-center text-muted-foreground text-sm">
          No notes yet. Press + to create one.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {notes.map((note) => (
            <Link
              className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
              key={note.id}
              params={{ noteId: note.id }}
              to="/notes/$noteId"
            >
              <HugeiconsIcon
                className="size-4 shrink-0 text-muted-foreground"
                icon={NoteIcon}
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {note.title || "Untitled"}
              </span>
              <span className="shrink-0 text-muted-foreground text-xs">
                {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
              </span>
            </Link>
          ))}
          <Link
            className="px-2 pt-1 text-muted-foreground text-xs hover:text-foreground"
            to="/notes"
          >
            View all →
          </Link>
        </div>
      )}
    </DashboardCard>
  );
}
