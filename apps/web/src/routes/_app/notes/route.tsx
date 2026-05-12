import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { NotesErrorView } from "@/modules/notes/ui/views/notes-error-view";
import { NotesView } from "@/modules/notes/ui/views/notes-view";

const notesSearchSchema = z.object({
  folder: z.string().optional(),
  tag: z.string().optional(),
  view: z.enum(["all", "pinned", "favorites", "archived"]).default("all"),
  q: z.string().optional(),
});

export const Route = createFileRoute("/_app/notes")({
  head: () => ({
    meta: [{ title: "Notes" }],
  }),
  validateSearch: (search: Record<string, unknown>) =>
    notesSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    folder: search.folder,
    tag: search.tag,
    view: search.view,
  }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.notes.folders.list.queryOptions({ input: {} })
      ),
      context.queryClient.ensureQueryData(
        context.orpc.notes.tags.list.queryOptions()
      ),
      context.queryClient.ensureQueryData(
        context.orpc.notes.list.queryOptions({
          input: {
            folderId: deps.folder ?? undefined,
            includeArchived: deps.view === "archived",
            limit: 50,
            offset: 0,
          },
        })
      ),
    ]),
  component: NotesView,
  errorComponent: NotesErrorView,
});
