"use client";

import { useListAccounts, useSession } from "@better-auth-ui/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { type SyntheticEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@memora/ui/components/button";
import { Card, CardContent } from "@memora/ui/components/card";
import { Field, FieldError, FieldGroup } from "@memora/ui/components/field";
import { Input } from "@memora/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@memora/ui/components/input-group";
import { Label } from "@memora/ui/components/label";
import { Separator } from "@memora/ui/components/separator";
import { Spinner } from "@memora/ui/components/spinner";

import { authClient } from "@/modules/auth/client";

interface EnableResponse {
  backupCodes: string[];
  totpURI: string;
}

type Step =
  | { kind: "idle" }
  | { kind: "password" }
  | { kind: "qr"; totpURI: string; backupCodes: string[] }
  | { kind: "backup-codes"; backupCodes: string[] }
  | { kind: "regenerate-password" };

interface TwoFactorProps {
  className?: string;
}

function passwordPromptLabel(kind: "password" | "regenerate-password"): string {
  if (kind === "password") {
    return "Continue";
  }
  return "Regenerate";
}

export function TwoFactor({ className }: TwoFactorProps) {
  const { data: session, refetch: refetchSession } = useSession();
  const { data: accounts, isPending: accountsPending } = useListAccounts();
  const queryClient = useQueryClient();

  const refreshGuards = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["auth", "session"] }),
      queryClient.refetchQueries({ queryKey: ["auth", "accounts"] }),
    ]);
  };

  const twoFactorEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)
      ?.twoFactorEnabled
  );
  const accountsLoaded = !accountsPending && accounts != null;
  const hasCredentialAccount =
    accountsLoaded &&
    accounts.some((account) => account.providerId === "credential");

  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep({ kind: "idle" });
    setPassword("");
    setVerifyCode("");
    setError(null);
  };

  const callEnable = async () => {
    setPending(true);
    setError(null);
    const { data, error: enableError } = await authClient.twoFactor.enable({
      password: hasCredentialAccount ? password : undefined,
    });
    setPending(false);

    if (enableError || !data) {
      const message = enableError?.message || "Could not enable 2FA.";
      setError(message);
      toast.error(message);
      return;
    }

    const payload = data as EnableResponse;
    setStep({
      kind: "qr",
      totpURI: payload.totpURI,
      backupCodes: payload.backupCodes,
    });
    setPassword("");
  };

  const callVerifyEnrollment = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (step.kind !== "qr") {
      return;
    }
    setPending(true);
    setError(null);
    const { error: verifyError } = await authClient.twoFactor.verifyTotp({
      code: verifyCode,
    });
    setPending(false);

    if (verifyError) {
      const message = verifyError.message || "Invalid code.";
      setError(message);
      toast.error(message);
      setVerifyCode("");
      return;
    }

    const codes = step.backupCodes;
    setStep({ kind: "backup-codes", backupCodes: codes });
    setVerifyCode("");
    refetchSession?.();
    refreshGuards();
    toast.success("Two-factor authentication enabled.");
  };

  const callRegenerate = async () => {
    setPending(true);
    setError(null);
    const { data, error: regenError } =
      await authClient.twoFactor.generateBackupCodes({
        password: hasCredentialAccount ? password : undefined,
      });
    setPending(false);

    if (regenError || !data) {
      const message = regenError?.message || "Could not regenerate codes.";
      setError(message);
      toast.error(message);
      return;
    }

    const codes = (data as { backupCodes: string[] }).backupCodes;
    setStep({ kind: "backup-codes", backupCodes: codes });
    setPassword("");
    toast.success("New backup codes generated.");
  };

  return (
    <div className={className}>
      <h2 className="mb-3 font-semibold text-sm">Two-factor authentication</h2>

      <Card>
        <CardContent className="flex flex-col gap-4">
          {step.kind === "idle" && (
            <IdleView
              disabled={!accountsLoaded}
              enabled={twoFactorEnabled}
              hasCredentialAccount={hasCredentialAccount}
              onEnable={() => {
                if (!accountsLoaded) {
                  return;
                }
                if (hasCredentialAccount) {
                  setStep({ kind: "password" });
                } else {
                  callEnable();
                }
              }}
              onRegenerate={() => {
                if (!accountsLoaded) {
                  return;
                }
                if (hasCredentialAccount) {
                  setStep({ kind: "regenerate-password" });
                } else {
                  callRegenerate();
                }
              }}
            />
          )}

          {(step.kind === "password" ||
            step.kind === "regenerate-password") && (
            <PasswordPrompt
              error={error}
              onCancel={reset}
              onSubmit={(event) => {
                event.preventDefault();
                if (step.kind === "password") {
                  callEnable();
                } else {
                  callRegenerate();
                }
              }}
              password={password}
              pending={pending}
              setPassword={setPassword}
              submitLabel={passwordPromptLabel(step.kind)}
            />
          )}

          {step.kind === "qr" && (
            <QrAndVerify
              code={verifyCode}
              error={error}
              onSubmit={callVerifyEnrollment}
              pending={pending}
              setCode={setVerifyCode}
              totpURI={step.totpURI}
            />
          )}

          {step.kind === "backup-codes" && (
            <BackupCodes codes={step.backupCodes} onDone={reset} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function IdleView({
  disabled,
  enabled,
  hasCredentialAccount: _hasCredentialAccount,
  onEnable,
  onRegenerate,
}: {
  disabled: boolean;
  enabled: boolean;
  hasCredentialAccount: boolean;
  onEnable: () => void;
  onRegenerate: () => void;
}) {
  if (!enabled) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Protect your account with a time-based authenticator app such as
          1Password, Authy, or Google Authenticator.
        </p>
        <div>
          <Button disabled={disabled} onClick={onEnable} type="button">
            Enable two-factor authentication
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        Two-factor authentication is active on this account and cannot be
        disabled.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled}
          onClick={onRegenerate}
          type="button"
          variant="outline"
        >
          Regenerate backup codes
        </Button>
      </div>
    </div>
  );
}

function PasswordPrompt({
  password,
  setPassword,
  onSubmit,
  onCancel,
  pending,
  submitLabel,
  error,
}: {
  password: string;
  setPassword: (value: string) => void;
  onSubmit: (event: SyntheticEvent) => void;
  onCancel: () => void;
  pending: boolean;
  submitLabel: string;
  error: string | null;
}) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <Label htmlFor="two-factor-password">Current password</Label>
          <Input
            autoComplete="current-password"
            autoFocus
            id="two-factor-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>
      <div className="flex gap-2">
        <Button disabled={pending || !password} type="submit">
          {pending ? <Spinner /> : submitLabel}
        </Button>
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function QrAndVerify({
  totpURI,
  code,
  setCode,
  onSubmit,
  pending,
  error,
}: {
  totpURI: string;
  code: string;
  setCode: (value: string) => void;
  onSubmit: (event: SyntheticEvent) => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col items-start gap-2">
        <div className="rounded-md bg-white p-3">
          <QRCodeSVG size={180} value={totpURI} />
        </div>
        <p className="text-muted-foreground text-sm">
          Scan with your authenticator, then enter the 6-digit code below.
        </p>
        <SecretField totpURI={totpURI} />
      </div>

      <Separator />

      <FieldGroup>
        <Field>
          <Label htmlFor="enrollment-code">Verification code</Label>
          <Input
            autoComplete="one-time-code"
            autoFocus
            id="enrollment-code"
            inputMode="numeric"
            onChange={(event) => setCode(event.target.value.trim())}
            placeholder="123456"
            required
            value={code}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>

      <Button disabled={pending || !code} type="submit">
        {pending ? <Spinner /> : "Verify and enable"}
      </Button>
    </form>
  );
}

function SecretField({ totpURI }: { totpURI: string }) {
  const secret = extractSecret(totpURI);
  const [copied, setCopied] = useState(false);

  if (!secret) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed. Select and copy manually.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <InputGroup>
        <InputGroupInput
          className="font-mono"
          onFocus={(event) => event.currentTarget.select()}
          readOnly
          value={secret}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            onClick={handleCopy}
            size="icon-xs"
            title="Copy"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              strokeWidth={2}
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <span className="text-muted-foreground text-xs">
        Can't scan? Enter this code into your authenticator or password manager:
      </span>
    </div>
  );
}

function extractSecret(totpURI: string): string | null {
  try {
    const url = new URL(totpURI);
    return url.searchParams.get("secret");
  } catch {
    return null;
  }
}

function BackupCodes({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  const handleDownload = () => {
    const blob = new Blob(
      [
        `Memora backup codes\nGenerated: ${new Date().toISOString()}\n\n${codes.join("\n")}\n`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "memora-backup-codes.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      toast.success("Backup codes copied.");
    } catch {
      toast.error("Copy failed.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        Save these backup codes somewhere safe. Each can be used once to sign in
        if you lose your authenticator. They will not be shown again.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-3 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownload} type="button" variant="outline">
          Download
        </Button>
        <Button onClick={handleCopyAll} type="button" variant="outline">
          Copy all
        </Button>
        <Button onClick={onDone} type="button">
          Close backup codes
        </Button>
      </div>
    </div>
  );
}
