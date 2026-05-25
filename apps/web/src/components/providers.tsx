import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

import { AuthProvider } from "@memora/ui/components/auth/auth-provider";
import { Toaster } from "@memora/ui/components/sonner";
import { useTheme } from "@memora/ui/components/theme-provider";
import { TooltipProvider } from "@memora/ui/components/tooltip";

import { authClient } from "@/modules/auth/client";

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = () => {
      navigate({ to: "/auth/two-factor" });
    };
    window.addEventListener("memora:two-factor-redirect", handler);
    return () =>
      window.removeEventListener("memora:two-factor-redirect", handler);
  }, [navigate]);

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
      redirectTo="/dashboard"
      socialProviders={["google"]}
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}
