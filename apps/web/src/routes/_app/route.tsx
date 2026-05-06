import { useAuthenticate } from "@better-auth-ui/react";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

import { AppShell } from "@/modules/app/ui/views/app-shell";
import { RootLoading } from "@/modules/app/ui/views/root/root-loading";

export const Route = createFileRoute("/_app")({
  component: AppShellLayout,
});

function AppShellLayout() {
  const { data: session } = useAuthenticate();
  const { pathname } = useLocation();

  if (!session) {
    return <RootLoading />;
  }

  return (
    <AppShell
      pathname={pathname}
      renderLink={(to, params) => <Link params={params} to={to} />}
      user={session.user}
    >
      <Outlet />
    </AppShell>
  );
}
