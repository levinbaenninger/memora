import { useAuthenticate } from "@better-auth-ui/react";
import { viewPaths } from "@better-auth-ui/react/core";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
  useSearch,
} from "@tanstack/react-router";

import { AppShell } from "@/modules/app/ui/views/app-shell";
import { authClient } from "@/modules/auth/client";

export const Route = createFileRoute("/_app")({
  async beforeLoad({ context }) {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["auth", "session"],
      queryFn: async () => {
        const { data } = await authClient.getSession();
        return data ?? null;
      },
      staleTime: Number.POSITIVE_INFINITY,
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
