"use client";

import { createReactInlineContentSpec } from "@blocknote/react";
import { isDefinedError, ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { cn } from "@memora/ui/lib/utils";

import { orpc } from "@/utils/orpc";

function NoteMention({ noteId, label }: { noteId: string; label: string }) {
  const router = useRouter();

  const existence = useQuery({
    ...orpc.notes.get.queryOptions({
      input: { id: noteId, includeArchived: true },
    }),
    enabled: Boolean(noteId),
    retry: false,
    staleTime: 30_000,
  });

  const isMissing =
    existence.isError &&
    existence.error instanceof ORPCError &&
    isDefinedError(existence.error) &&
    existence.error.code === "NOT_FOUND";

  const handleClick = () => {
    if (!noteId || isMissing) {
      return;
    }
    router.navigate({
      to: "/notes/$noteId",
      params: { noteId },
    });
  };

  return (
    <button
      className={cn(
        "inline-flex items-center rounded px-1 py-0.5 font-medium text-sm",
        isMissing
          ? "cursor-not-allowed bg-destructive/10 text-destructive line-through"
          : "cursor-pointer bg-accent text-accent-foreground hover:bg-accent/80"
      )}
      disabled={isMissing}
      onClick={handleClick}
      title={isMissing ? "Linked note was deleted" : undefined}
      type="button"
    >
      @{label || "note"}
      {isMissing ? " (deleted)" : ""}
    </button>
  );
}

export const noteMentionSpec = createReactInlineContentSpec(
  {
    type: "noteMention",
    propSchema: {
      noteId: { default: "" },
      label: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { noteId, label } = props.inlineContent.props;
      return <NoteMention label={label} noteId={noteId} />;
    },
  }
);
