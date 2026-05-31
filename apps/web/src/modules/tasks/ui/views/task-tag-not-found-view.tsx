import { Tag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@memora/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@memora/ui/components/empty";

export function TaskTagNotFoundView() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Tag not found</EmptyTitle>
          <EmptyDescription>
            This tag may have been deleted or doesn't exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onClick={() => navigate({ to: "/tasks" })}
            size="sm"
            variant="outline"
          >
            Go to tasks
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
