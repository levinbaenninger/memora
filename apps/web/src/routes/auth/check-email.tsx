import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { CheckEmail } from "@memora/ui/components/auth/check-email";

import { authClient } from "@/modules/auth/client";
import { safeRedirect } from "@/modules/auth/safe-redirect";

const checkEmailSearchSchema = z.object({
  email: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/check-email")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) =>
    checkEmailSearchSchema.parse(search),
  async beforeLoad({ search }) {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({ to: safeRedirect(search.redirect) });
    }
  },
  head: () => ({
    meta: [{ title: "Check Your Email | Memora" }],
  }),
  component: CheckEmailPage,
});

function CheckEmailPage() {
  const { email } = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <CheckEmail email={email} />
    </div>
  );
}
