import { viewPaths } from "@better-auth-ui/react/core";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { Auth } from "@memora/ui/components/auth/auth";

import { authClient } from "@/modules/auth/client";
import { safeRedirect } from "@/modules/auth/safe-redirect";

const authPathTitles: Record<string, string> = {
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "sign-in": "Sign In",
  "sign-out": "Sign Out",
  "sign-up": "Sign Up",
};

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/$path")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) =>
    authSearchSchema.parse(search),
  async beforeLoad({ params: { path }, search }) {
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
      throw redirect({ replace: true, to: safeRedirect(search.redirect) });
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
