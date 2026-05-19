import { isDefinedError, ORPCError } from "@orpc/client";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { NoteEditorView } from "@/modules/notes/ui/views/note-editor-view";
import { NotesErrorView } from "@/modules/notes/ui/views/notes-error-view";
import { NotesLoadingView } from "@/modules/notes/ui/views/notes-loading-view";
import { NotesNotFoundView } from "@/modules/notes/ui/views/notes-not-found-view";

const noteDetailSearchSchema = z.object({
  from: z.string().optional(),
});

export const Route = createFileRoute("/_app/notes/$noteId")({
  validateSearch: (search: Record<string, unknown>) =>
    noteDetailSearchSchema.parse(search),
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(
        context.orpc.notes.get.queryOptions({
          input: { id: params.noteId, includeArchived: true },
        })
      );
    } catch (e) {
      if (
        e instanceof ORPCError &&
        isDefinedError(e) &&
        e.code === "NOT_FOUND"
      ) {
        throw notFound();
      }
      throw e;
    }
  },
  component: NoteEditorView,
  pendingComponent: NotesLoadingView,
  errorComponent: NotesErrorView,
  notFoundComponent: NotesNotFoundView,
});
