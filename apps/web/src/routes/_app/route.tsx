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
      if (token) {
        window.localStorage.removeItem(PENDING_DUPLICATE_TOKEN_KEY);
      }
    } catch {
      return;
    }
    if (!token) {
      return;
    }
    drainedRef.current = true;
    client.notes.shares
      .duplicate({ token })
      .then(({ id }) => {
        toast.success("Note duplicated");
        navigate({ to: "/notes/$noteId", params: { noteId: id } });
      })
      .catch(() => {
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
