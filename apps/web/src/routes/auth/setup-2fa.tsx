import { viewPaths } from "@better-auth-ui/react/core";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/modules/auth/client";
import { TwoFactorSetup } from "@/modules/auth/ui/two-factor-setup";

export const Route = createFileRoute("/auth/setup-2fa")({
  ssr: false,
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
    if (twoFactorEnabled) {
      throw redirect({ replace: true, to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [{ title: "Set up two-factor authentication | Memora" }],
  }),
  component: SetupPage,
});

function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <TwoFactorSetup />
    </div>
  );
}
