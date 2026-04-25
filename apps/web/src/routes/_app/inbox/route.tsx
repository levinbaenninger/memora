import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/inbox")({
  head: () => ({
    meta: [{ title: "Inbox" }],
  }),
  component: InboxPage,
});

function InboxPage() {
  return <p className="text-muted-foreground text-sm">Inbox</p>;
}
