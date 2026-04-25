import { Button, buttonVariants } from "@memora/ui/components/button";
import { Link } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";

export function RootError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="rounded-none border bg-card p-6">
          <div className="flex flex-col gap-3">
            <TriangleAlertIcon />
            <div className="flex flex-col gap-1">
              <h1 className="font-medium text-sm">Something went wrong.</h1>
              <p className="text-muted-foreground text-xs/relaxed">
                {error.message || "The page could not be rendered right now."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => reset()} type="button">
                Try again
              </Button>
              <Link
                className={buttonVariants({ size: "sm", variant: "outline" })}
                to="/"
              >
                Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
