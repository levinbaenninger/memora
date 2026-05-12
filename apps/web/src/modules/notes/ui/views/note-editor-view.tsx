"use client";

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
import { BacklinksPanel } from "../components/note-editor/backlinks-panel";
import { EditorToolbar } from "../components/note-editor/editor-toolbar";
import { NoteProperties } from "../components/note-editor/note-properties";
import {
  TipTapEditor,
  useNoteEditor,
} from "../components/note-editor/tiptap-editor";

export function NoteEditorView() {
  const { noteId } = useParams({ from: "/_app/notes/$noteId" });
  const { data: note } = useNote(noteId);
  const updateNote = useUpdateNote();
  const restoreNote = useRestoreNote();
  const deleteNote = useDeleteNote();
  const { setSaveStatus } = useNotesStore();

  const titleRef = useRef<HTMLInputElement>(null);

  const debouncedUpdateContent = useDebouncedCallback(
    (content: object) => {
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

  const editor = useNoteEditor({
    content: note.content as never,
    editable: !isArchived,
    noteId,
    onUpdate: (content) => {
      setSaveStatus("saving");
      debouncedUpdateContent(content);
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset title only when navigating to different note
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.value = note.title;
    }
  }, [note.id]);

  return (
    <div className="flex min-h-full flex-col">
      <EditorToolbar
        editor={editor}
        favorite={note.favorite}
        noteId={noteId}
        pinned={note.pinned}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6">
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

        <div className="pt-4">
          <input
            className="w-full bg-transparent font-bold text-2xl outline-none placeholder:text-muted-foreground"
            defaultValue={note.title}
            disabled={isArchived}
            onChange={(e) => {
              setSaveStatus("saving");
              debouncedUpdateTitle(e.target.value);
            }}
            placeholder="Untitled"
            ref={titleRef}
          />
        </div>

        <div className="flex-1">
          <TipTapEditor className="[&_.ProseMirror]:px-0" editor={editor} />
        </div>
      </div>

      <NoteProperties
        folderId={note.folderId}
        noteId={noteId}
        tags={note.tags}
      />

      <BacklinksPanel noteId={noteId} />
    </div>
  );
}
