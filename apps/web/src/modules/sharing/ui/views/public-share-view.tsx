import type { PartialBlock } from "@blocknote/core";
import { Link } from "@tanstack/react-router";

import { BlockNoteReadOnlyView } from "@/modules/notes/ui/components/note-editor/blocknote-read-only-view";

interface Props {
  title: string;
  content: PartialBlock[];
  ownerName: string;
  updatedAt: Date;
}

export function PublicShareView({ title, content, ownerName, updatedAt }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link className="font-semibold text-lg" to="/">
            Memora
          </Link>
          <span className="rounded-full border border-border px-3 py-1 text-muted-foreground text-xs">
            Shared note
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-bold text-3xl">{title || "Untitled"}</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Shared by {ownerName} · Updated{" "}
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
          }).format(updatedAt)}
        </p>

        <div className="mt-8">
          <BlockNoteReadOnlyView content={content} />
        </div>
      </main>
    </div>
  );
}

export function PublicShareNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-bold text-2xl">Link invalid or expired</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          This share link is no longer available. Ask the owner to send a new
          one.
        </p>
        <Link
          className="mt-6 inline-block rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          to="/"
        >
          Go to Memora
        </Link>
      </div>
    </div>
  );
}
