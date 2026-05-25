"use client";

import { useListAccounts, useSession } from "@better-auth-ui/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { type SyntheticEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@memora/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@memora/ui/components/card";
import { Field, FieldError, FieldGroup } from "@memora/ui/components/field";
import { Input } from "@memora/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@memora/ui/components/input-group";
import { Label } from "@memora/ui/components/label";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@memora/ui/components/reui/stepper";
import { Separator } from "@memora/ui/components/separator";
import { Spinner } from "@memora/ui/components/spinner";

import { authClient } from "@/modules/auth/client";
import { safeRedirect } from "@/modules/auth/safe-redirect";

type Step =
  | { kind: "password" }
  | { kind: "qr"; totpURI: string; backupCodes: string[] }
  | { kind: "backup-codes"; backupCodes: string[] };

interface EnableResponse {
  backupCodes: string[];
  totpURI: string;
}

export function TwoFactorSetup() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: unknown };
  const redirectTarget = safeRedirect(search?.redirect);
  const queryClient = useQueryClient();
  const { refetch: refetchSession } = useSession();
  const { data: accounts, isPending: accountsPending } = useListAccounts();

  const accountsLoaded = !accountsPending && accounts != null;
  const hasCredentialAccount =
    accountsLoaded &&
    accounts.some((account) => account.providerId === "credential");

  const [step, setStep] = useState<Step>({ kind: "password" });
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [savedCodes, setSavedCodes] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callEnable = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!accountsLoaded) {
      return;
    }
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

  const callVerify = async (event: SyntheticEvent) => {
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

    setStep({ kind: "backup-codes", backupCodes: step.backupCodes });
    setVerifyCode("");
    refetchSession?.();
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["auth", "session"] }),
      queryClient.refetchQueries({ queryKey: ["auth", "accounts"] }),
    ]);
    toast.success("Two-factor authentication enabled.");
  };

  const handleFinish = async () => {
    await queryClient.refetchQueries({ queryKey: ["auth", "session"] });
    navigate({ to: redirectTarget });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/auth/$path", params: { path: "sign-in" } });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set up two-factor authentication</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Memora requires two-factor authentication on accounts with a password.
          Complete the setup below to continue.
        </p>

        <StepIndicator current={step.kind} />

        {step.kind === "password" && (
          <PasswordStep
            accountsLoaded={accountsLoaded}
            error={error}
            hasCredentialAccount={hasCredentialAccount}
            onSubmit={callEnable}
            password={password}
            pending={pending}
            setPassword={setPassword}
          />
        )}

        {step.kind === "qr" && (
          <QrStep
            code={verifyCode}
            error={error}
            onSubmit={callVerify}
            pending={pending}
            setCode={setVerifyCode}
            totpURI={step.totpURI}
          />
        )}

        {step.kind === "backup-codes" && (
          <BackupCodesStep
            codes={step.backupCodes}
            onFinish={handleFinish}
            saved={savedCodes}
            setSaved={setSavedCodes}
          />
        )}

        <Separator />

        <button
          className="self-start text-muted-foreground text-xs underline-offset-4 hover:underline"
          onClick={handleSignOut}
          type="button"
        >
          Sign out and finish later
        </button>
      </CardContent>
    </Card>
  );
}

const STEP_ORDER: Step["kind"][] = ["password", "qr", "backup-codes"];
const STEP_LABELS: Record<Step["kind"], string> = {
  password: "Authenticate",
  qr: "Scan code",
  "backup-codes": "Save codes",
};

function StepIndicator({ current }: { current: Step["kind"] }) {
  const activeStep = STEP_ORDER.indexOf(current) + 1;

  return (
    <Stepper value={activeStep}>
      <StepperNav>
        {STEP_ORDER.map((kind, index) => (
          <StepperItem key={kind} step={index + 1}>
            <StepperTrigger
              className="cursor-default"
              disabled
              onClick={(event) => event.preventDefault()}
            >
              <StepperIndicator>{index + 1}</StepperIndicator>
              <StepperTitle>{STEP_LABELS[kind]}</StepperTitle>
            </StepperTrigger>
            {index < STEP_ORDER.length - 1 && <StepperSeparator />}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  );
}

function PasswordStep({
  accountsLoaded,
  password,
  setPassword,
  onSubmit,
  pending,
  hasCredentialAccount,
  error,
}: {
  accountsLoaded: boolean;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: (event: SyntheticEvent) => void;
  pending: boolean;
  hasCredentialAccount: boolean;
  error: string | null;
}) {
  if (!accountsLoaded) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (!hasCredentialAccount) {
    return (
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <p className="text-sm">
          Click continue to generate your authenticator code.
        </p>
        <Button disabled={pending} type="submit">
          {pending ? <Spinner /> : "Continue"}
        </Button>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <Label htmlFor="setup-password">Current password</Label>
          <Input
            autoComplete="current-password"
            autoFocus
            id="setup-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>
      <Button disabled={pending || !password} type="submit">
        {pending ? <Spinner /> : "Continue"}
      </Button>
    </form>
  );
}

function QrStep({
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
  const secret = extractSecret(totpURI);

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col items-start gap-3">
        <div className="rounded-md bg-white p-3">
          <QRCodeSVG size={180} value={totpURI} />
        </div>
        <p className="text-muted-foreground text-sm">
          Scan with your authenticator (1Password, Authy, Google Authenticator,
          etc.), then enter the 6-digit code below.
        </p>
        {secret && (
          <div className="flex w-full flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Can't scan? Enter this code manually:
            </span>
            <CopyInput value={secret} />
          </div>
        )}
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

function BackupCodesStep({
  codes,
  saved,
  setSaved,
  onFinish,
}: {
  codes: string[];
  saved: boolean;
  setSaved: (value: boolean) => void;
  onFinish: () => void;
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
    setSaved(true);
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      toast.success("Backup codes copied.");
      setSaved(true);
    } catch {
      toast.error("Copy failed.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
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
      </div>
      <label className="flex items-start gap-2 text-sm" htmlFor="codes-saved">
        <input
          aria-label="I have saved these codes in a safe place"
          checked={saved}
          className="mt-1"
          id="codes-saved"
          onChange={(event) => setSaved(event.target.checked)}
          type="checkbox"
        />
        <span>I have saved these codes in a safe place.</span>
      </label>
      <Button disabled={!saved} onClick={onFinish} type="button">
        Continue to Memora
      </Button>
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

function CopyInput({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed.");
    }
  };

  return (
    <InputGroup>
      <InputGroupInput
        className="font-mono"
        onFocus={(event) => event.currentTarget.select()}
        readOnly
        value={value}
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
  );
}
