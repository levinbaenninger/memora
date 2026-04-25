import { useAuthenticate } from "@better-auth-ui/react";
import { AppShell } from "@memora/ui/components/app-shell";
import { Spinner } from "@memora/ui/components/spinner";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: AppShellLayout,
});

function AppShellLayout() {
  const { data: session } = useAuthenticate();
  const { pathname } = useLocation();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <AppShell
      pathname={pathname}
      renderLink={(to) => <Link to={to} />}
      user={session.user}
    >
      <Outlet />
    </AppShell>
  );
}
