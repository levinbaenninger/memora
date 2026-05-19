import {
  Add01Icon,
  Alert01Icon,
  ArrowDown01Icon,
  NoteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button } from "@memora/ui/components/button";
import { ButtonGroup } from "@memora/ui/components/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@memora/ui/components/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@memora/ui/components/empty";
import { Spinner } from "@memora/ui/components/spinner";

import { useCreateNote } from "@/modules/notes/mutations";
import { type NoteView, useNotesList } from "@/modules/notes/queries";
import { NoteCard } from "../components/note-card";

interface NoteGridViewProps {
  contextActions?: ReactNode;
  folderId?: string;
  tagId?: string;
  title: string;
  titleIcon?: ReactNode;
  view: NoteView;
}

export function NoteGridView({
  contextActions,
  folderId,
  tagId,
  title,
  titleIcon,
  view,
}: NoteGridViewProps) {
  const createNote = useCreateNote();
  const { pathname } = useLocation();

  const { notes, isPending, isError } = useNotesList({
    folderId,
    tagId,
    view,
  });

  const handleCreate = () => {
    createNote.mutate({
      title: "Untitled",
      content: [],
      folderId,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 font-semibold text-2xl [&>svg]:size-5">
          {titleIcon}
          {title}
        </h1>
        {contextActions ? (
          <ButtonGroup>
            <Button
              disabled={createNote.isPending}
              onClick={handleCreate}
              size="sm"
            >
              <HugeiconsIcon
                className="size-4"
                icon={Add01Icon}
                strokeWidth={2}
              />
              New note
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(props) => (
                  <Button {...props} className="px-2" size="sm">
                    <HugeiconsIcon
                      className="size-4"
                      icon={ArrowDown01Icon}
                      strokeWidth={2}
                    />
                  </Button>
                )}
              />
              <DropdownMenuContent align="end">
                {contextActions}
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        ) : (
          <Button
            disabled={createNote.isPending}
            onClick={handleCreate}
            size="sm"
          >
            <HugeiconsIcon
              className="size-4"
              icon={Add01Icon}
              strokeWidth={2}
            />
            New note
          </Button>
        )}
      </div>

      {isPending && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="size-6" />
        </div>
      )}

      {!isPending && isError && (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Couldn't load notes</EmptyTitle>
            <EmptyDescription>
              Something went wrong fetching this view. Try refreshing the page.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!(isPending || isError) && notes.length === 0 && (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={NoteIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No notes yet</EmptyTitle>
            <EmptyDescription>
              {view === "pinned" && "Pin a note to keep it within reach."}
              {view === "favorites" &&
                "Star notes to find your favorites here."}
              {view === "archived" && "Archived notes will show up here."}
              {view === "all" &&
                folderId &&
                "This folder is empty. Create a note to get started."}
              {view === "all" && tagId && "No notes carry this tag yet."}
              {view === "all" &&
                !folderId &&
                !tagId &&
                "Create your first note to get started."}
            </EmptyDescription>
          </EmptyHeader>
          {view !== "archived" && (
            <EmptyContent>
              <Button
                disabled={createNote.isPending}
                onClick={handleCreate}
                size="sm"
              >
                <HugeiconsIcon
                  className="size-4"
                  icon={Add01Icon}
                  strokeWidth={2}
                />
                New note
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}

      {!(isPending || isError) && notes.length > 0 && (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(14rem, 100%), 1fr))",
          }}
        >
          {notes.map((note) => (
            <NoteCard
              favorite={note.favorite}
              folderName={note.folder?.name}
              fromPath={pathname}
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
      )}
    </div>
  );
}
