"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { NoteCard } from "@/modules/notes/ui/components/note-card";
import { orpc } from "@/utils/orpc";

export function RecentNotes() {
  const { data: notes } = useSuspenseQuery(
    orpc.notes.list.queryOptions({
      input: { includeArchived: false, limit: 8, offset: 0 },
    })
  );

  if (notes.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-sm">Recently edited</h2>
        <Link
          className="text-muted-foreground text-xs hover:text-foreground"
          to="/notes"
        >
          View all
        </Link>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(14rem, 100%), 1fr))",
        }}
      >
        {notes.map((note) => (
          <NoteCard
            favorite={note.favorite}
            folderName={note.folder?.name}
            id={note.id}
            isArchived={!!note.archivedAt}
            key={note.id}
            pinned={note.pinned}
            snippet={note.snippet}
            tags={note.tags}
            title={note.title}
            updatedAt={note.updatedAt}
          />
        ))}
      </div>
    </section>
  );
}
