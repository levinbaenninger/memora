"use client";

import type { PartialBlock } from "@blocknote/core";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useParams } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@memora/ui/components/alert";
import { Button } from "@memora/ui/components/button";

import {
  useDeleteNote,
  useRestoreNote,
  useUpdateNote,
} from "@/modules/notes/mutations";
import { useNote } from "@/modules/notes/queries";
import { useNotesStore } from "@/modules/notes/store";
import { BlockNoteEditorView } from "../components/note-editor/blocknote-editor";
import { NoteActionsMenu } from "../components/note-editor/note-actions-menu";
import { NoteMetadataStrip } from "../components/note-editor/note-metadata-strip";

export function NoteEditorView() {
  const { noteId } = useParams({ from: "/_app/notes/$noteId" });
  const { data: note } = useNote(noteId);
  const updateNote = useUpdateNote();
  const restoreNote = useRestoreNote();
  const deleteNote = useDeleteNote();
  const { setSaveStatus } = useNotesStore();

  const titleRef = useRef<HTMLInputElement>(null);

  const debouncedUpdateContent = useDebouncedCallback(
    (content: PartialBlock[]) => {
      updateNote.mutate({ id: noteId, content: content as never });
    },
    { wait: 1000 }
  );

  const debouncedUpdateTitle = useDebouncedCallback(
    (title: string) => {
      updateNote.mutate({ id: noteId, title });
    },
    { wait: 500 }
  );

  const isArchived = !!note.archivedAt;
  const initialContent = (note.content ?? []) as PartialBlock[];

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset title only when navigating to different note
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.value = note.title;
    }
  }, [note.id]);

  useEffect(() => {
    document.title = `${note.title || "Untitled"} | Memora`;
  }, [note.title]);

  return (
    <div className="flex min-h-full min-w-0 flex-col">
      <div className="flex w-full min-w-0 flex-1 flex-col">
        {isArchived && (
          <div className="pt-4">
            <Alert>
              <AlertTitle>This note is archived</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-2">
                <span>Archived notes are read-only.</span>
                <Button
                  className="h-6 px-2 text-xs"
                  onClick={() => restoreNote.mutate(noteId)}
                  size="sm"
                  variant="outline"
                >
                  Restore
                </Button>
                <Button
                  className="h-6 px-2 text-xs"
                  onClick={() => deleteNote.mutate(noteId)}
                  size="sm"
                  variant="destructive"
                >
                  Delete permanently
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-6">
          <input
            className="min-w-0 flex-1 bg-transparent font-bold text-3xl outline-none placeholder:text-muted-foreground"
            defaultValue={note.title}
            disabled={isArchived}
            onChange={(e) => {
              setSaveStatus("saving");
              debouncedUpdateTitle(e.target.value);
            }}
            placeholder="Untitled"
            ref={titleRef}
          />
          <NoteActionsMenu
            favorite={note.favorite}
            noteId={noteId}
            pinned={note.pinned}
          />
        </div>

        <NoteMetadataStrip
          disabled={isArchived}
          folderId={note.folderId}
          noteId={noteId}
          tags={note.tags}
        />

        <div className="flex-1 border-t pt-4">
          <BlockNoteEditorView
            content={initialContent}
            editable={!isArchived}
            noteId={noteId}
            onUpdate={(content) => {
              setSaveStatus("saving");
              debouncedUpdateContent(content);
            }}
          />
        </div>
      </div>
    </div>
  );
}
