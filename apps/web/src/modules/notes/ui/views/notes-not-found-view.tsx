import { FileNotFoundIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@memora/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@memora/ui/components/empty";

export function NotesNotFoundView() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Empty className="max-w-sm">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FileNotFoundIcon} />
          </EmptyMedia>
          <EmptyTitle>Note not found</EmptyTitle>
          <EmptyDescription>
            This note may have been deleted or you do not have access to it.
          </EmptyDescription>
        </EmptyHeader>
        <Link
          className={buttonVariants({ variant: "outline" })}
          search={{ view: "all" }}
          to="/notes"
        >
          Back to notes
        </Link>
      </Empty>
    </div>
  );
}
