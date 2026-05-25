import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

import { AuthProvider } from "@memora/ui/components/auth/auth-provider";
import { Toaster } from "@memora/ui/components/sonner";
import { useTheme } from "@memora/ui/components/theme-provider";
import { TooltipProvider } from "@memora/ui/components/tooltip";

import { authClient } from "@/modules/auth/client";
import { safeRedirect } from "@/modules/auth/safe-redirect";

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const search = useSearch({ strict: false }) as { redirect?: unknown };
  const redirectTo = safeRedirect(search?.redirect);

  useEffect(() => {
    const handler = () => {
      navigate({
        to: "/auth/two-factor",
        search: { redirect: redirectTo },
      });
    };
    window.addEventListener("memora:two-factor-redirect", handler);
    return () =>
      window.removeEventListener("memora:two-factor-redirect", handler);
  }, [navigate, redirectTo]);

  return (
    <AuthProvider
      appearance={{
        theme,
        setTheme: setTheme as (theme: string) => void,
        themes: ["system", "light", "dark"],
      }}
      authClient={authClient}
      deleteUser={{ enabled: true }}
      emailAndPassword={{
        enabled: true,
        confirmPassword: true,
        requireEmailVerification: true,
      }}
      Link={Link}
      navigate={navigate}
      redirectTo={redirectTo}
      socialProviders={["google"]}
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}
