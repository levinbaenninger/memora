import { useAuth, useSendVerificationEmail } from "@better-auth-ui/react"
import { MailCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@memora/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@memora/ui/components/card"
import { FieldDescription } from "@memora/ui/components/field"
import { Spinner } from "@memora/ui/components/spinner"
import { cn } from "@memora/ui/lib/utils"

const RESEND_COOLDOWN_SECONDS = 30

type CheckEmailProps = {
  className?: string
  /** Address the verification email was sent to, shown for reassurance. */
  email?: string
}

/**
 * Persistent confirmation screen shown after sign-up when email verification
 * is required. Tells the user to check their inbox and lets them resend the
 * verification email behind a cooldown.
 */
export function CheckEmail({ className, email }: CheckEmailProps) {
  const { basePaths, baseURL, localization, redirectTo, viewPaths, Link } =
    useAuth()

  // Email was just sent during sign-up, so start on cooldown to discourage an
  // immediate redundant resend.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const { mutate: sendVerificationEmail, isPending } = useSendVerificationEmail(
    {
      onSuccess: () => {
        toast.success(localization.auth.verificationEmailSent)
        setCooldown(RESEND_COOLDOWN_SECONDS)
      },
      onError: (error) => {
        toast.error(error.error?.message || error.message)
      }
    }
  )

  const handleResend = () => {
    if (!email || cooldown > 0 || isPending) {
      return
    }

    sendVerificationEmail({
      email,
      callbackURL: `${baseURL}${redirectTo}`
    })
  }

  const canResend = !!email && cooldown <= 0 && !isPending

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-full">
            <MailCheck className="size-5" />
          </div>

          <CardTitle className="text-xl font-semibold">
            {localization.auth.verifyYourEmail}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          <FieldDescription>
            {email ? (
              <>
                We sent a verification link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                Click it to verify your address and finish signing in.
              </>
            ) : (
              <>
                We sent a verification link to your email. Click it to verify
                your address and finish signing in.
              </>
            )}
          </FieldDescription>

          {email && (
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!canResend}
                onClick={handleResend}
              >
                {isPending && <Spinner />}

                {cooldown > 0
                  ? `${localization.auth.resend} in ${cooldown}s`
                  : localization.auth.resend}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <FieldDescription>
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </FieldDescription>
      </CardFooter>
    </Card>
  )
}
