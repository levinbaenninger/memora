"use client";

import { useSession } from "@better-auth-ui/react";
import { Suspense } from "react";

import { Skeleton } from "@memora/ui/components/skeleton";

import { QuickCapture } from "@/modules/dashboard/ui/components/quick-capture";
import { RecentNotes } from "@/modules/dashboard/ui/components/recent-notes";
import { UpcomingTasks } from "@/modules/dashboard/ui/components/upcoming-tasks";

function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 5) {
    return "Still up";
  }
  if (h < 12) {
    return "Good morning";
  }
  if (h < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function firstName(
  user:
    | {
        displayUsername?: string | null;
        email?: string;
        name?: string;
        username?: string | null;
      }
    | undefined
): string | undefined {
  if (!user) {
    return;
  }
  const candidate = user.displayUsername || user.name || user.username;
  if (candidate) {
    return candidate.split(" ")[0];
  }
  return user.email?.split("@")[0];
}

function UpcomingTasksSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder
          <Skeleton className="h-10 w-full rounded-lg" key={i} />
        ))}
      </div>
    </div>
  );
}

export function DashboardView() {
  const { data: session } = useSession();
  const now = new Date();
  const name = firstName(session?.user);
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">
          {greeting(now)}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">{dateLabel}</p>
      </header>

      <QuickCapture />

      <Suspense fallback={<UpcomingTasksSkeleton />}>
        <UpcomingTasks />
      </Suspense>

      <RecentNotes />
    </div>
  );
}
