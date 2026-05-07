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

export function RootNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Empty className="border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={FileNotFoundIcon} />
            </EmptyMedia>
            <EmptyTitle>Page not found</EmptyTitle>
            <EmptyDescription>
              The page you asked for does not exist.
            </EmptyDescription>
          </EmptyHeader>
          <Link className={buttonVariants()} to="/">
            Go home
          </Link>
        </Empty>
      </div>
    </main>
  );
}
