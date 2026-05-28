"use client";

import {
  Copy01Icon,
  Delete01Icon,
  Link04Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@memora/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@memora/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@memora/ui/components/select";

import { orpc } from "@/utils/orpc";
import { useCreateShare, useRevokeShare } from "../../mutations";
import { useSharePopoverStore } from "../../store";

type Expiry = "none" | "1d" | "7d" | "30d";

const EXPIRY_LABELS: Record<Expiry, string> = {
  none: "No expiry",
  "1d": "Expires in 1 day",
  "7d": "Expires in 7 days",
  "30d": "Expires in 30 days",
};

function buildShareUrl(token: string): string {
  if (typeof window === "undefined") {
    return `/share/${token}`;
  }
  return `${window.location.origin}/share/${token}`;
}

const EXPIRY_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function formatExpiry(date: Date | null): string {
  if (!date) {
    return "Never expires";
  }
  return `Expires ${EXPIRY_DATE_FORMAT.format(date)}`;
}

interface Props {
  disabled?: boolean;
  noteId: string;
}

interface ShareRow {
  expiresAt: Date | null;
  id: string;
  token: string;
}

function SharesList({
  isLoading,
  shares,
  onCopy,
  onRevoke,
  revokePending,
}: {
  isLoading: boolean;
  shares: ShareRow[];
  onCopy: (token: string) => void;
  onRevoke: (id: string) => void;
  revokePending: boolean;
}) {
  if (isLoading) {
    return <p className="py-2 text-muted-foreground text-xs">Loading…</p>;
  }
  if (shares.length === 0) {
    return (
      <p className="py-2 text-muted-foreground text-xs">
        No active share links.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-1">
      {shares.map((share) => (
        <li
          className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
          key={share.id}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs">
              …/{share.token.slice(-8)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {formatExpiry(share.expiresAt)}
            </p>
          </div>
          <Button
            aria-label="Copy share link"
            onClick={() => onCopy(share.token)}
            size="icon-xs"
            variant="ghost"
          >
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
          </Button>
          <Button
            aria-label="Revoke share link"
            disabled={revokePending}
            onClick={() => onRevoke(share.id)}
            size="icon-xs"
            variant="ghost"
          >
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function SharePopover({ noteId, disabled }: Props) {
  const { openForNoteId, open, close } = useSharePopoverStore();
  const isOpen = openForNoteId === noteId;
  const [expiry, setExpiry] = useState<Expiry>("none");

  const sharesQuery = useQuery({
    ...orpc.notes.shares.list.queryOptions({ input: { noteId } }),
    enabled: isOpen,
  });

  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();

  const handleOpenChange = (next: boolean) => {
    if (next) {
      open(noteId);
    } else {
      close();
    }
  };

  const handleCreate = () => {
    createShare.mutate(
      { noteId, expiry },
      {
        onSuccess: async (share) => {
          try {
            await navigator.clipboard.writeText(buildShareUrl(share.token));
            toast.success("Share link created and copied");
          } catch {
            toast.success("Share link created");
          }
        },
      }
    );
  };

  const handleCopy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(token));
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const shares = sharesQuery.data ?? [];

  return (
    <Popover onOpenChange={handleOpenChange} open={isOpen}>
      <PopoverTrigger
        aria-label="Share note"
        disabled={disabled}
        render={
          <Button size="icon-sm" variant="ghost">
            <HugeiconsIcon
              className="size-4"
              icon={Share01Icon}
              strokeWidth={2}
            />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-sm">Share note</h3>
          <p className="text-muted-foreground text-xs">
            Anyone with the link can read this note.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={(v) => setExpiry(v as Expiry)} value={expiry}>
            <SelectTrigger className="flex-1">
              <SelectValue>
                {(value: unknown) =>
                  EXPIRY_LABELS[value as Expiry] ?? EXPIRY_LABELS.none
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectItem value="none">No expiry</SelectItem>
              <SelectItem value="1d">Expires in 1 day</SelectItem>
              <SelectItem value="7d">Expires in 7 days</SelectItem>
              <SelectItem value="30d">Expires in 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            disabled={createShare.isPending}
            onClick={handleCreate}
            size="sm"
            variant="default"
          >
            <HugeiconsIcon icon={Link04Icon} strokeWidth={2} />
            Create link
          </Button>
        </div>

        <div className="-mx-1 max-h-64 overflow-y-auto px-1">
          <SharesList
            isLoading={sharesQuery.isLoading}
            onCopy={handleCopy}
            onRevoke={(id) => revokeShare.mutate({ id })}
            revokePending={revokeShare.isPending}
            shares={shares}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
