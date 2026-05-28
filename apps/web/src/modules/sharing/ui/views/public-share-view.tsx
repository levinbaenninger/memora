import type { PartialBlock } from "@blocknote/core";
import { NoteAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@memora/ui/components/button";

import { LogoIcon } from "@/modules/app/ui/components/logo";
import { authClient } from "@/modules/auth/client";
import { BlockNoteReadOnlyView } from "@/modules/notes/ui/components/note-editor/blocknote-read-only-view";
import { PENDING_DUPLICATE_TOKEN_KEY } from "@/modules/sharing/pending-duplicate";
import { client } from "@/utils/orpc";

const UPDATED_AT_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

interface Props {
  content: PartialBlock[];
  ownerName: string;
  title: string;
  updatedAt: Date;
}

function PublicShareHeader() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link
          aria-label="Memora"
          className="flex items-center gap-2 font-semibold text-lg"
          to="/"
        >
          <LogoIcon className="size-6 text-primary" />
          <span>Memora</span>
        </Link>
        <span className="rounded-full border border-border px-3 py-1 text-muted-foreground text-xs">
          Shared note
        </span>
      </div>
    </header>
  );
}

function DuplicateButton() {
  const { token } = useParams({ from: "/share/$token" });
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [pending, setPending] = useState(false);

  const handleDuplicate = async () => {
    if (!session) {
      try {
        window.localStorage.setItem(PENDING_DUPLICATE_TOKEN_KEY, token);
      } catch {
        // localStorage may be blocked; sign-in still works, duplicate will not auto-trigger.
      }
      navigate({ to: "/auth/$path", params: { path: "sign-in" } });
      return;
    }

    setPending(true);
    try {
      const { id } = await client.notes.shares.duplicate({ token });
      toast.success("Note duplicated");
      navigate({ to: "/notes/$noteId", params: { noteId: id } });
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === "TOO_MANY_REQUESTS") {
        toast.error("Too many requests. Try again later.");
      } else {
        toast.error("Could not duplicate this note.");
      }
      setPending(false);
    }
  };

  return (
    <Button
      disabled={pending}
      onClick={handleDuplicate}
      size="sm"
      variant="outline"
    >
      <HugeiconsIcon icon={NoteAddIcon} strokeWidth={2} />
      {session ? "Duplicate to my notes" : "Sign in to duplicate"}
    </Button>
  );
}

export function PublicShareView({
  title,
  content,
  ownerName,
  updatedAt,
}: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicShareHeader />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-3xl">{title || "Untitled"}</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Shared by {ownerName} · Updated{" "}
              {UPDATED_AT_FORMAT.format(updatedAt)}
            </p>
          </div>
          <DuplicateButton />
        </div>

        <div className="mt-8">
          <BlockNoteReadOnlyView content={content} />
        </div>
      </main>
    </div>
  );
}

export function PublicShareSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicShareHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-8 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="mt-3 h-4 w-1/3 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 flex flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-11/12 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-10/12 animate-pulse rounded-md bg-muted" />
        </div>
      </main>
    </div>
  );
}

export function PublicShareNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-semibold text-2xl">Link invalid or expired</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          This share link is no longer available. Ask the owner to send a new
          one.
        </p>
        <Link
          className="mt-6 inline-block rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          to="/"
        >
          Go to Memora
        </Link>
      </div>
    </div>
  );
}

export function PublicShareError({ error }: { error: Error }) {
  // React Query aborts in-flight queries when the route unmounts (e.g. on
  // navigate-away after duplicate). The thrown CancelledError isn't a real
  // failure — render the skeleton until the new route takes over.
  const name = (error as { name?: string } | null)?.name;
  if (name === "CancelledError") {
    return <PublicShareSkeleton />;
  }
  const code = (error as { code?: string } | null)?.code;
  if (code === "TOO_MANY_REQUESTS") {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
        <div className="max-w-md text-center">
          <h1 className="font-semibold text-2xl">Too many requests</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            You've opened too many share links in a short window. Wait a minute
            and try again.
          </p>
        </div>
      </div>
    );
  }
  return <PublicShareNotFound />;
}
