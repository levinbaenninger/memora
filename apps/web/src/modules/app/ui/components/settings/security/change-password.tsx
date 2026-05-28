import {
  useAuth,
  useChangePassword,
  useListAccounts,
  useRequestPasswordReset,
  useSession,
} from "@better-auth-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { type SyntheticEvent, useReducer } from "react";
import { toast } from "sonner";

import {
  PasswordRequirements,
  usePasswordRequirementsVisibility,
} from "@memora/ui/components/auth/password-requirements";
import { Button } from "@memora/ui/components/button";
import { Card, CardContent, CardFooter } from "@memora/ui/components/card";
import { Field, FieldError } from "@memora/ui/components/field";
import { Input } from "@memora/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@memora/ui/components/input-group";
import { Label } from "@memora/ui/components/label";
import { Spinner } from "@memora/ui/components/spinner";
import { isPasswordPolicyValid } from "@memora/ui/lib/password-policy";
import { cn } from "@memora/ui/lib/utils";

interface ChangePasswordProps {
  className?: string;
}

/**
 * Render a card form for changing the authenticated user's password.
 *
 * When the user has a credential account, displays fields for current password,
 * new password, and optionally confirm password. When the user only has social
 * accounts, displays a prompt to set a password via the reset flow.
 *
 * @returns A JSX element containing the change-password or set-password card
 */
export function ChangePassword({ className }: ChangePasswordProps) {
  const { emailAndPassword, localization } = useAuth();
  const { data: session } = useSession();
  const { data: accounts, isPending: isAccountsPending } = useListAccounts();

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  );

  if (!(isAccountsPending || hasCredentialAccount)) {
    return <SetPassword className={className} />;
  }

  return (
    <ChangePasswordForm
      className={className}
      emailAndPassword={emailAndPassword}
      localization={localization}
      session={isAccountsPending ? undefined : session}
    />
  );
}

function SetPassword({ className }: { className?: string }) {
  const { basePaths, localization, viewPaths } = useAuth();
  const { data: session } = useSession();

  const { mutate: requestPasswordReset, isPending } = useRequestPasswordReset({
    onSuccess: () => toast.success(localization.auth.passwordResetEmailSent),
  });

  const handleSetPassword = () => {
    if (!session) {
      return;
    }

    requestPasswordReset({
      email: session.user.email,
      redirectTo: `${window.location.origin}${basePaths.auth}/${viewPaths.auth.resetPassword}`,
    });
  };

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">
        {localization.settings.changePassword}
      </h2>

      <Card className={cn(className)}>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-sm leading-tight">
              {localization.settings.setPassword}
            </p>

            <p className="mt-0.5 text-muted-foreground text-xs">
              {localization.settings.setPasswordDescription}
            </p>
          </div>

          <Button
            disabled={isPending || !session}
            onClick={handleSetPassword}
            size="sm"
          >
            {isPending && <Spinner />}

            {localization.auth.sendResetLink}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

type FormField = "currentPassword" | "newPassword" | "confirmPassword";

interface ChangePasswordState {
  errors: Partial<Record<FormField, string>>;
  values: Record<FormField, string>;
  visible: { newPassword: boolean; confirmPassword: boolean };
}

type ChangePasswordAction =
  | { type: "setValue"; field: FormField; value: string }
  | { type: "setError"; field: FormField; message: string | undefined }
  | { type: "toggleVisible"; field: "newPassword" | "confirmPassword" }
  | { type: "resetValues" };

const initialChangePasswordState: ChangePasswordState = {
  values: { currentPassword: "", newPassword: "", confirmPassword: "" },
  visible: { newPassword: false, confirmPassword: false },
  errors: {},
};

function changePasswordReducer(
  state: ChangePasswordState,
  action: ChangePasswordAction
): ChangePasswordState {
  switch (action.type) {
    case "setValue":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case "setError":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };
    case "toggleVisible":
      return {
        ...state,
        visible: {
          ...state.visible,
          [action.field]: !state.visible[action.field],
        },
      };
    case "resetValues":
      return { ...state, values: initialChangePasswordState.values };
    default:
      return state;
  }
}

function ChangePasswordForm({
  className,
  emailAndPassword,
  localization,
  session,
}: {
  className?: string;
  emailAndPassword: ReturnType<typeof useAuth>["emailAndPassword"];
  localization: ReturnType<typeof useAuth>["localization"];
  session: ReturnType<typeof useSession>["data"];
}) {
  const [state, dispatch] = useReducer(
    changePasswordReducer,
    initialChangePasswordState
  );
  const { values, visible, errors: fieldErrors } = state;
  const { currentPassword, newPassword, confirmPassword } = values;
  const isNewPasswordVisible = visible.newPassword;
  const isConfirmPasswordVisible = visible.confirmPassword;
  const passwordVisibility = usePasswordRequirementsVisibility(newPassword);

  const { mutate: changePassword, isPending } = useChangePassword({
    onError: (error) => {
      dispatch({ type: "resetValues" });
      toast.error(error.message);
    },
    onSuccess: () => {
      dispatch({ type: "resetValues" });
      toast.success(localization.settings.changePasswordSuccess);
    },
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailAndPassword.confirmPassword && newPassword !== confirmPassword) {
      dispatch({ type: "resetValues" });
      toast.error(localization.auth.passwordsDoNotMatch);
      return;
    }

    changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
  };

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">
        {localization.settings.changePassword}
      </h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            <Field data-invalid={!!fieldErrors.currentPassword}>
              <Label htmlFor="currentPassword">
                {localization.settings.currentPassword}
              </Label>

              {session ? (
                <Input
                  aria-invalid={!!fieldErrors.currentPassword}
                  autoComplete="current-password"
                  disabled={isPending}
                  id="currentPassword"
                  name="currentPassword"
                  onChange={(e) =>
                    dispatch({
                      type: "setValue",
                      field: "currentPassword",
                      value: e.target.value,
                    })
                  }
                  onInvalid={(e) => {
                    e.preventDefault();
                    dispatch({
                      type: "setError",
                      field: "currentPassword",
                      message: (e.target as HTMLInputElement).validationMessage,
                    });
                  }}
                  placeholder={localization.settings.currentPasswordPlaceholder}
                  required
                  type="password"
                  value={currentPassword}
                />
              ) : (
                <Input disabled id="currentPassword" />
              )}

              <FieldError>{fieldErrors.currentPassword}</FieldError>
            </Field>

            <Field data-invalid={!!fieldErrors.newPassword}>
              <Label htmlFor="newPassword">
                {localization.auth.newPassword}
              </Label>

              {session ? (
                <InputGroup>
                  <InputGroupInput
                    aria-describedby="password-requirements"
                    aria-invalid={!!fieldErrors.newPassword}
                    autoComplete="new-password"
                    disabled={isPending}
                    id="newPassword"
                    maxLength={emailAndPassword.maxPasswordLength}
                    minLength={emailAndPassword.minPasswordLength}
                    name="newPassword"
                    onBlur={passwordVisibility.onBlur}
                    onChange={(e) =>
                      dispatch({
                        type: "setValue",
                        field: "newPassword",
                        value: e.target.value,
                      })
                    }
                    onFocus={passwordVisibility.onFocus}
                    onInvalid={(e) => {
                      e.preventDefault();
                      dispatch({
                        type: "setError",
                        field: "newPassword",
                        message: (e.target as HTMLInputElement)
                          .validationMessage,
                      });
                    }}
                    placeholder={localization.auth.newPasswordPlaceholder}
                    required
                    type={isNewPasswordVisible ? "text" : "password"}
                    value={newPassword}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        isNewPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      disabled={isPending}
                      onClick={() =>
                        dispatch({
                          type: "toggleVisible",
                          field: "newPassword",
                        })
                      }
                      size="icon-xs"
                    >
                      {isNewPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              ) : (
                <Input disabled id="newPassword" />
              )}

              {passwordVisibility.shown && (
                <PasswordRequirements
                  alwaysVisible
                  className="mt-1"
                  id="password-requirements"
                  password={newPassword}
                />
              )}

              <FieldError>{fieldErrors.newPassword}</FieldError>
            </Field>

            {emailAndPassword.confirmPassword && (
              <Field data-invalid={!!fieldErrors.confirmPassword}>
                <Label htmlFor="confirmPassword">
                  {localization.auth.confirmPassword}
                </Label>

                {session ? (
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={!!fieldErrors.confirmPassword}
                      autoComplete="new-password"
                      disabled={isPending}
                      id="confirmPassword"
                      maxLength={emailAndPassword.maxPasswordLength}
                      minLength={emailAndPassword.minPasswordLength}
                      name="confirmPassword"
                      onChange={(e) =>
                        dispatch({
                          type: "setValue",
                          field: "confirmPassword",
                          value: e.target.value,
                        })
                      }
                      onInvalid={(e) => {
                        e.preventDefault();
                        dispatch({
                          type: "setError",
                          field: "confirmPassword",
                          message: (e.target as HTMLInputElement)
                            .validationMessage,
                        });
                      }}
                      placeholder={localization.auth.confirmPasswordPlaceholder}
                      required
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          isConfirmPasswordVisible
                            ? localization.auth.hidePassword
                            : localization.auth.showPassword
                        }
                        disabled={isPending}
                        onClick={() =>
                          dispatch({
                            type: "toggleVisible",
                            field: "confirmPassword",
                          })
                        }
                        size="icon-xs"
                      >
                        {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                ) : (
                  <Input disabled id="confirmPassword" />
                )}

                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
            )}
          </CardContent>

          <CardFooter>
            <Button
              disabled={
                isPending || !session || !isPasswordPolicyValid(newPassword)
              }
              size="sm"
              type="submit"
            >
              {isPending && <Spinner />}

              {localization.settings.updatePassword}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
