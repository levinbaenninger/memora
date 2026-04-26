import { viewPaths } from "@better-auth-ui/react/core";
import { Auth } from "@memora/ui/components/auth/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

const authPathTitles: Record<string, string> = {
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "sign-in": "Sign In",
  "sign-out": "Sign Out",
  "sign-up": "Sign Up",
};

export const Route = createFileRoute("/auth/$path")({
  head: ({ params }) => ({
    meta: [{ title: authPathTitles[params.path] ?? "Authentication" }],
  }),
  ssr: false,
  beforeLoad({ params: { path } }) {
    if (!Object.values(viewPaths.auth).includes(path)) {
      throw redirect({ to: "/" });
    }
  },
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
