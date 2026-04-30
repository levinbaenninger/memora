import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, buttonVariants } from "@memora/ui/components/button";
import { Card, CardContent } from "@memora/ui/components/card";
import * as Sentry from "@sentry/tanstackstart-react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

export function RootError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <HugeiconsIcon className="size-4" icon={Alert02Icon} />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-medium text-sm">Something went wrong.</h1>
              <p className="text-muted-foreground text-xs/relaxed">
                {error.message || "The page could not be rendered right now."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => reset()} size="sm" type="button">
                Try again
              </Button>
              <Link
                className={buttonVariants({ size: "sm", variant: "outline" })}
                to="/"
              >
                Back home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
