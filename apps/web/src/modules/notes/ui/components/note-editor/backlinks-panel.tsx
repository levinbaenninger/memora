import { Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@memora/ui/components/collapsible";
import { Skeleton } from "@memora/ui/components/skeleton";
import { cn } from "@memora/ui/lib/utils";

import {
  useNoteBacklinks,
  useNoteOutboundLinks,
} from "@/modules/notes/queries";

interface LinkCardProps {
  id: string;
  snippet: string;
  title: string;
}

function LinkCard({ id, title, snippet }: LinkCardProps) {
  return (
    <Link
      className="block rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent/50"
      params={{ noteId: id }}
      search={(prev) => ({ ...prev, view: prev.view ?? "all" })}
      to="/notes/$noteId"
    >
      <p
        className={cn(
          "truncate font-medium",
          !title && "text-muted-foreground italic"
        )}
      >
        {title || "Untitled"}
      </p>
      {snippet && (
        <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">
          {snippet}
        </p>
      )}
    </Link>
  );
}

function LinkSection({
  label,
  noteId,
  useLinks,
}: {
  label: string;
  noteId: string;
  useLinks: (id: string) => ReturnType<typeof useNoteBacklinks>;
}) {
  const { data, isPending } = useLinks(noteId);
  const count = data?.length ?? 0;

  return (
    <Collapsible defaultOpen={count > 0}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-2 font-medium text-muted-foreground text-xs hover:text-foreground">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon
            className="size-3.5"
            icon={Link01Icon}
            strokeWidth={2}
          />
          {label}
        </span>
        <span className="tabular-nums">{count}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 px-6 pb-3">
          {isPending && (
            <>
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </>
          )}
          {!isPending && count === 0 && (
            <p className="py-1 text-muted-foreground text-xs">No links</p>
          )}
          {!isPending &&
            count > 0 &&
            data?.map((note) => (
              <LinkCard
                id={note.id}
                key={note.id}
                snippet={note.snippet}
                title={note.title}
              />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function BacklinksPanel({ noteId }: { noteId: string }) {
  return (
    <div className="border-t">
      <div className="mx-auto w-full max-w-3xl py-2">
        <LinkSection
          label="Links to"
          noteId={noteId}
          useLinks={useNoteOutboundLinks}
        />
        <LinkSection
          label="Linked from"
          noteId={noteId}
          useLinks={useNoteBacklinks}
        />
      </div>
    </div>
  );
}
