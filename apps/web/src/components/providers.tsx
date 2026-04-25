import { AuthProvider } from "@memora/ui/components/auth/auth-provider";
import { Toaster } from "@memora/ui/components/sonner";
import { useTheme } from "@memora/ui/components/theme-provider";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { authClient } from "@/modules/auth/client";

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
      redirectTo="/"
      socialProviders={["google"]}
    >
      {children}
      <Toaster />
    </AuthProvider>
  );
}
