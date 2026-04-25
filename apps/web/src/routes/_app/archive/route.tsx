import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/archive")({
  head: () => ({
    meta: [{ title: "Archive" }],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  return <p className="text-muted-foreground text-sm">Archive</p>;
}
