import { useAuthenticate } from "@better-auth-ui/react";
import { viewPaths } from "@better-auth-ui/react/core";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { AppShell } from "@/modules/app/ui/views/app-shell";
import { authClient } from "@/modules/auth/client";
import { PENDING_DUPLICATE_TOKEN_KEY } from "@/modules/sharing/pending-duplicate";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/_app")({
  async beforeLoad({ context }) {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["auth", "session"],
      queryFn: async () => {
        const { data } = await authClient.getSession();
        return data ?? null;
      },
      staleTime: 5 * 60 * 1000,
    });
    if (!session) {
      throw redirect({
        params: { path: viewPaths.auth.signIn },
        replace: true,
        to: "/auth/$path",
      });
    }

    const twoFactorEnabled = Boolean(
      (session.user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled
    );
    if (!twoFactorEnabled) {
      const accounts = await context.queryClient.ensureQueryData({
        queryKey: ["auth", "accounts", session.user.id],
        queryFn: async () => {
          const { data } = await authClient.listAccounts();
          return data ?? [];
        },
        staleTime: 5 * 60 * 1000,
      });
      const hasCredential = accounts.some(
        (account) => account.providerId === "credential"
      );
      if (hasCredential) {
        throw redirect({
          replace: true,
          to: "/auth/setup-2fa",
        });
      }
    }
  },
  component: AppShellLayout,
});

function AppShellLayout() {
  const { data: session } = useAuthenticate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const drainedRef = useRef(false);

  useEffect(() => {
    if (drainedRef.current || !session) {
      return;
    }
    let token: string | null = null;
    try {
      token = window.localStorage.getItem(PENDING_DUPLICATE_TOKEN_KEY);
    } catch {
      return;
    }
    if (!token) {
      return;
    }
    drainedRef.current = true;
    const clearToken = () => {
      try {
        window.localStorage.removeItem(PENDING_DUPLICATE_TOKEN_KEY);
      } catch {
        // localStorage may be blocked; nothing to clean up.
      }
    };
    client.notes.shares
      .duplicate({ token })
      .then(({ id }) => {
        clearToken();
        toast.success("Note duplicated");
        navigate({ to: "/notes/$noteId", params: { noteId: id } });
      })
      .catch((error: unknown) => {
        // Only clear the token for definite server-side failures (a
        // structured error code that isn't a rate limit). Plain JS errors
        // — network blips, parse errors, anything without a `code` — are
        // treated as transient and leave the token in place so a later
        // visit can retry.
        const code = (error as { code?: string } | null)?.code;
        if (code !== undefined && code !== "TOO_MANY_REQUESTS") {
          clearToken();
        }
        toast.error("Could not duplicate the shared note.");
      });
  }, [navigate, session]);

  return (
    <AppShell
      currentSearch={search as Record<string, unknown>}
      pathname={pathname}
      renderLink={(to, params, linkSearch) => (
        // biome-ignore lint/suspicious/noExplicitAny: TanStack Router search types require cast
        <Link params={params} search={linkSearch as any} to={to} />
      )}
      user={session?.user}
    >
      <Outlet />
    </AppShell>
  );
}
