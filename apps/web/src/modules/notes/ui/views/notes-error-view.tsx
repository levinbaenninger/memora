import { Alert01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@memora/ui/components/alert";
import { Button } from "@memora/ui/components/button";

export function NotesErrorView({ error }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <Alert variant="destructive">
          <HugeiconsIcon
            className="size-4"
            icon={Alert01Icon}
            strokeWidth={2}
          />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load note."}
          </AlertDescription>
        </Alert>
        <Button
          className="w-full"
          onClick={() => router.invalidate()}
          variant="outline"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
