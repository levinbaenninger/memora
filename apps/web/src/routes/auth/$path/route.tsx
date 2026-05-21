import { viewPaths } from "@better-auth-ui/react/core";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Auth } from "@memora/ui/components/auth/auth";

import { authClient } from "@/modules/auth/client";

const authPathTitles: Record<string, string> = {
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "sign-in": "Sign In",
  "sign-out": "Sign Out",
  "sign-up": "Sign Up",
};

export const Route = createFileRoute("/auth/$path")({
  ssr: false,
  async beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.auth).includes(path)) {
      throw redirect({ to: "/" });
    }

    const { data: session } = await authClient.getSession();

    if (path === viewPaths.auth.signOut && !session) {
      throw redirect({
        params: { path: viewPaths.auth.signIn },
        replace: true,
        to: "/auth/$path",
      });
    }

    if (path !== viewPaths.auth.signOut && session) {
      throw redirect({ replace: true, to: "/dashboard" });
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `${authPathTitles[params.path] ?? "Authentication"} | Memora` },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { path } = Route.useParams();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <Auth path={path} />
    </div>
  );
}
