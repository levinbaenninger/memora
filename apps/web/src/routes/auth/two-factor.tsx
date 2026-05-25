import { createFileRoute, redirect } from "@tanstack/react-router";

import { TwoFactorChallenge } from "@memora/ui/components/auth/two-factor/two-factor-challenge";

import { authClient } from "@/modules/auth/client";

export const Route = createFileRoute("/auth/two-factor")({
  ssr: false,
  async beforeLoad() {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [{ title: "Two-Factor Authentication | Memora" }],
  }),
  component: TwoFactorPage,
});

function TwoFactorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <TwoFactorChallenge />
    </div>
  );
}
