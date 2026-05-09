import { createFileRoute } from "@tanstack/react-router";

import { NoteEditorView } from "@/modules/notes/ui/views/note-editor-view";
import { NotesErrorView } from "@/modules/notes/ui/views/notes-error-view";

export const Route = createFileRoute("/_app/notes/$noteId")({
  component: NoteEditorView,
  errorComponent: NotesErrorView,
});
