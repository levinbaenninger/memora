"use client";

import { useSession } from "@better-auth-ui/react";

import { QuickCapture } from "@/modules/dashboard/ui/components/quick-capture";
import { RecentNotes } from "@/modules/dashboard/ui/components/recent-notes";

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

      <RecentNotes />
    </div>
  );
}
