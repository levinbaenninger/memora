"use client"

import { useAuth, useSignInPasskey } from "@better-auth-ui/react"
import { Fingerprint } from "lucide-react"
import { Button } from "@memora/ui/components/button"
import { Spinner } from "@memora/ui/components/spinner"
import { cn } from "@memora/ui/lib/utils"

export type PasskeyButtonProps = {
  isPending: boolean
}

export function PasskeyButton({ isPending }: PasskeyButtonProps) {
  const { localization, redirectTo, navigate } = useAuth()

  const { mutate: signInPasskey, isPending: passkeyPending } = useSignInPasskey(
    {
      onSuccess: () => navigate({ to: redirectTo })
    }
  )

  const isDisabled = isPending || passkeyPending

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isDisabled}
      className={cn("w-full", isDisabled && "opacity-50 pointer-events-none")}
      onClick={() => signInPasskey()}
    >
      {passkeyPending ? <Spinner /> : <Fingerprint />}
      {localization.auth.continueWith.replace(
        "{{provider}}",
        localization.auth.passkey
      )}
    </Button>
  )
}
