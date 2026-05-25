"use client";

import { useAuth } from "@better-auth-ui/react";
import { type SyntheticEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@memora/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@memora/ui/components/card";
import { Checkbox } from "@memora/ui/components/checkbox";
import { Field, FieldError, FieldGroup } from "@memora/ui/components/field";
import { Input } from "@memora/ui/components/input";
import { Label } from "@memora/ui/components/label";
import { Spinner } from "@memora/ui/components/spinner";
import { cn } from "@memora/ui/lib/utils";

type Mode = "totp" | "backup";

type TwoFactorClient = {
  twoFactor: {
    verifyTotp: (args: {
      code: string;
      trustDevice?: boolean;
    }) => Promise<{ data: unknown; error: { message?: string } | null }>;
    verifyBackupCode: (args: {
      code: string;
      trustDevice?: boolean;
    }) => Promise<{ data: unknown; error: { message?: string } | null }>;
  };
};

export function TwoFactorChallenge({ className }: { className?: string }) {
  const { authClient, navigate, redirectTo } = useAuth();
  const client = authClient as unknown as TwoFactorClient;

  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!code) {
      return;
    }
    setPending(true);
    setError(null);

    const verify =
      mode === "totp"
        ? client.twoFactor.verifyTotp
        : client.twoFactor.verifyBackupCode;

    try {
      const { error: verifyError } = await verify({ code, trustDevice });

      if (verifyError) {
        const message = verifyError.message || "Invalid code. Try again.";
        setError(message);
        toast.error(message);
        setCode("");
        return;
      }

      toast.success("Verified.");
      navigate({ to: redirectTo || "/dashboard" });
    } catch {
      const message = "Could not verify code. Check your connection and try again.";
      setError(message);
      toast.error(message);
      setCode("");
    } finally {
      setPending(false);
    }
  };

  const inputLabel = mode === "totp" ? "Authenticator code" : "Backup code";
  const inputPlaceholder = mode === "totp" ? "123456" : "xxxxxxxxxx";

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="two-factor-code">{inputLabel}</Label>
              <Input
                autoComplete="one-time-code"
                autoFocus
                id="two-factor-code"
                inputMode={mode === "totp" ? "numeric" : "text"}
                onChange={(event) => setCode(event.target.value.trim())}
                placeholder={inputPlaceholder}
                required
                value={code}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                checked={trustDevice}
                id="trust-device"
                onCheckedChange={(value) => setTrustDevice(Boolean(value))}
              />
              <Label htmlFor="trust-device">
                Trust this device for 30 days
              </Label>
            </Field>
          </FieldGroup>

          <Button disabled={pending || !code} type="submit">
            {pending ? <Spinner /> : "Verify"}
          </Button>

          <button
            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "totp" ? "backup" : "totp");
              setCode("");
              setError(null);
            }}
            type="button"
          >
            {mode === "totp"
              ? "Lost your authenticator? Use a backup code"
              : "Use authenticator code instead"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
