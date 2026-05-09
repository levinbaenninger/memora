import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

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
  component: NotesView,
});
