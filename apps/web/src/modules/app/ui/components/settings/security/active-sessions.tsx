"use client";

import { useAuth, useListSessions, useSession } from "@better-auth-ui/react";

import { Card, CardContent } from "@memora/ui/components/card";
import { Separator } from "@memora/ui/components/separator";
import { Spinner } from "@memora/ui/components/spinner";
import { cn } from "@memora/ui/lib/utils";

import { ActiveSession } from "./active-session";

interface ActiveSessionsProps {
  className?: string;
}

/**
 * Render a card listing all active sessions for the current user with revoke controls.
 *
 * Shows each session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @returns A JSX element containing the sessions card
 */
export function ActiveSessions({ className }: ActiveSessionsProps) {
  const { localization } = useAuth();
  const { data: session } = useSession();

  const { data: sessions, isPending } = useListSessions();

  const currentSessionId = session?.session.id;
  const activeSessions = [...(sessions ?? [])].sort((a, b) => {
    if (a.id === currentSessionId && b.id !== currentSessionId) {
      return -1;
    }

    if (b.id === currentSessionId && a.id !== currentSessionId) {
      return 1;
    }

    return 0;
  });

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">
        {localization.settings.activeSessions}
      </h2>

      <Card className={cn("p-0", className)}>
        <CardContent className="p-0">
          {isPending ? (
            <div className="flex justify-center p-6">
              <Spinner className="size-5" />
            </div>
          ) : (
            activeSessions.map((activeSession, index) => (
              <div key={activeSession.id}>
                {index > 0 && <Separator />}

                <ActiveSession activeSession={activeSession} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
