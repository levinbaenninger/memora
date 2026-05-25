"use client"

import { Check, Circle } from "lucide-react"
import { useState } from "react"

import { cn } from "@memora/ui/lib/utils"
import { PASSWORD_RULES } from "@memora/ui/lib/password-policy"

type PasswordRequirementsProps = {
  password: string
  /**
   * Force the requirements list visible regardless of focus state.
   * Useful for surfaces that always want it shown (e.g., reset password).
   */
  alwaysVisible?: boolean
  className?: string
  /**
   * The HTML id of the password input this list describes.
   * Wired up via `aria-describedby` on the caller.
   */
  id?: string
}

/**
 * Live, on-focus checklist of password policy rules.
 *
 * The list is hidden by default and revealed when the underlying password
 * input gains focus (managed by the caller via `onFocus` / `onBlur` toggling
 * the consumer's local state) or when `alwaysVisible` is set. Each rule row
 * shows gray when unmet and green with a check when met — never red — so live
 * typing does not flash error states on every keystroke.
 *
 * The rules render even for an empty password so the user sees the full
 * checklist on focus. HIBP is intentionally not represented here because the
 * check only runs server-side at submit time.
 */
export function PasswordRequirements({
  password,
  alwaysVisible = false,
  className,
  id,
}: PasswordRequirementsProps) {
  return (
    <ul
      id={id}
      className={cn(
        "flex flex-col gap-1 text-xs",
        !alwaysVisible && "hidden focus-within:flex peer-focus:flex",
        className,
      )}
      aria-label="Password requirements"
    >
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password)
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 transition-colors",
              met ? "text-emerald-600" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <Circle className="size-3.5 shrink-0" aria-hidden />
            )}
            <span>{rule.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Convenience hook for the on-focus reveal pattern.
 *
 * Returns `{ shown, onFocus, onBlur }`. The list stays visible while focused
 * and after blur if the password still has unmet rules — so a user who tabs
 * away mid-typing keeps the explanation on screen rather than losing it.
 */
export function usePasswordRequirementsVisibility(password: string) {
  const [focused, setFocused] = useState(false)

  const allMet = PASSWORD_RULES.every((rule) => rule.test(password))
  const shown = focused || (!allMet && password.length > 0)

  return {
    shown,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }
}

export function isPasswordPolicyValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password))
}
