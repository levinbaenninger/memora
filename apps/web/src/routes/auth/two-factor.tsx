import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { TwoFactorChallenge } from "@memora/ui/components/auth/two-factor/two-factor-challenge";

import { authClient } from "@/modules/auth/client";
import { safeRedirect } from "@/modules/auth/safe-redirect";

const twoFactorSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/two-factor")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) =>
    twoFactorSearchSchema.parse(search),
  async beforeLoad({ search }) {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({ to: safeRedirect(search.redirect) });
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
