import { useAuthenticate } from "@better-auth-ui/react";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useSearch,
} from "@tanstack/react-router";

import { AppShell } from "@/modules/app/ui/views/app-shell";

export const Route = createFileRoute("/_app")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.notes.folders.list.queryOptions({ input: {} })
      ),
      context.queryClient.ensureQueryData(
        context.orpc.notes.tags.list.queryOptions()
      ),
    ]),
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
