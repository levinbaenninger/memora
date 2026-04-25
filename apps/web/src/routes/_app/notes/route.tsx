import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({
    meta: [{ title: "Notes" }],
  }),
  component: NotesPage,
});

function NotesPage() {
  return <p className="text-muted-foreground text-sm">Notes</p>;
}
