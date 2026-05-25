import { sentinelClient } from "@better-auth/infra/client";
import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  plugins: [
    sentinelClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.dispatchEvent(new CustomEvent("memora:two-factor-redirect"));
      },
    }),
  ],
  fetchOptions: {
    onError: ({ response }) => {
      if (response.status !== 429) {
        return;
      }
      const retryAfter = response.headers.get("X-Retry-After");
      const seconds = retryAfter ? Number.parseInt(retryAfter, 10) : null;
      const suffix =
        seconds && Number.isFinite(seconds)
          ? ` Try again in ${seconds}s.`
          : " Try again in a moment.";
      toast.error(`Too many requests.${suffix}`, { id: "auth-rate-limit" });
    },
  },
});
