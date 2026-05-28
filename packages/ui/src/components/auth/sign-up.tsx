import {
  useAuth,
  useIsUsernameAvailable,
  useSignUpEmail
} from "@better-auth-ui/react"
import { useDebouncer } from "@tanstack/react-pacer"
import { Check, Eye, EyeOff, X } from "lucide-react"
import { type SyntheticEvent, useReducer } from "react"
import { toast } from "sonner"
import { Button } from "@memora/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@memora/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator
} from "@memora/ui/components/field"
import { Input } from "@memora/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@memora/ui/components/input-group"
import { Spinner } from "@memora/ui/components/spinner"
import { cn } from "@memora/ui/lib/utils"
import { Label } from "@memora/ui/components/label"
import {
  PasswordRequirements,
  usePasswordRequirementsVisibility
} from "./password-requirements"
import { isPasswordPolicyValid } from "@memora/ui/lib/password-policy"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

type SignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

type FormState = {
  password: string
  confirmPassword: string
  username: string
  isPasswordVisible: boolean
  isConfirmPasswordVisible: boolean
  fieldErrors: FieldErrors
}

type FormAction =
  | { type: "setPassword"; value: string }
  | { type: "setConfirmPassword"; value: string }
  | { type: "setUsername"; value: string }
  | { type: "togglePasswordVisibility" }
  | { type: "toggleConfirmPasswordVisibility" }
  | { type: "setFieldError"; field: keyof FieldErrors; value: string | undefined }
  | { type: "clearPasswords" }

const initialFormState: FormState = {
  password: "",
  confirmPassword: "",
  username: "",
  isPasswordVisible: false,
  isConfirmPasswordVisible: false,
  fieldErrors: {}
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "setPassword":
      return {
        ...state,
        password: action.value,
        fieldErrors: { ...state.fieldErrors, password: undefined }
      }
    case "setConfirmPassword":
      return {
        ...state,
        confirmPassword: action.value,
        fieldErrors: { ...state.fieldErrors, confirmPassword: undefined }
      }
    case "setUsername":
      return { ...state, username: action.value }
    case "togglePasswordVisibility":
      return { ...state, isPasswordVisible: !state.isPasswordVisible }
    case "toggleConfirmPasswordVisibility":
      return {
        ...state,
        isConfirmPasswordVisible: !state.isConfirmPasswordVisible
      }
    case "setFieldError":
      return {
        ...state,
        fieldErrors: { ...state.fieldErrors, [action.field]: action.value }
      }
    case "clearPasswords":
      return { ...state, password: "", confirmPassword: "" }
    default:
      return state
  }
}

/**
 * Renders a sign-up form with name, email, and password fields, optional social provider buttons, and submission handling.
 *
 * Submits credentials to the configured auth client and handles the response:
 * - If email verification is required, shows a notification and navigates to sign-in
 * - On success, refreshes the session and navigates to the configured redirect path
 * - On failure, displays error toasts
 * - Manages a pending state while the request is in-flight
 *
 * @param className - Additional CSS classes applied to the outer container
 * @param socialLayout - Social layout to apply to the component
 * @param socialPosition - Social position to apply to the component
 * @returns The sign-up form React element.
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom"
}: SignUpProps) {
  const {
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    redirectTo,
    socialProviders,
    username: usernameConfig,
    viewPaths,
    navigate,
    Link
  } = useAuth()

  const [state, dispatch] = useReducer(formReducer, initialFormState)
  const {
    password,
    confirmPassword,
    username,
    isPasswordVisible,
    isConfirmPasswordVisible,
    fieldErrors
  } = state

  const {
    mutate: isUsernameAvailable,
    data: usernameData,
    error: usernameError,
    reset: resetUsername
  } = useIsUsernameAvailable()

  const usernameDebouncer = useDebouncer(
    (value: string) => {
      if (!value.trim()) {
        resetUsername()
        return
      }

      isUsernameAvailable({ username: value.trim() })
    },
    { wait: 500 }
  )

  function handleUsernameChange(value: string) {
    dispatch({ type: "setUsername", value })
    resetUsername()

    if (usernameConfig?.isUsernameAvailable) {
      usernameDebouncer.maybeExecute(value)
    }
  }

  const { mutate: signUpEmail, isPending: signUpPending } = useSignUpEmail({
    onError: (error) => {
      dispatch({ type: "clearPasswords" })
      toast.error(error.error?.message || error.message)
    },
    onSuccess: (_data, variables) => {
      if (emailAndPassword?.requireEmailVerification) {
        const params = new URLSearchParams({
          email: variables.email,
          redirect: redirectTo
        })
        navigate({ to: `${basePaths.auth}/check-email?${params.toString()}` })
      } else {
        navigate({ to: redirectTo })
      }
    }
  })

  const isPending = signUpPending

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch)
      dispatch({ type: "clearPasswords" })
      return
    }

    signUpEmail({
      name,
      email,
      password,
      callbackURL: `${baseURL}${redirectTo}`,
      ...(usernameConfig?.enabled
        ? {
            username: username.trim(),
            ...(usernameConfig.displayUsername
              ? { displayUsername: username.trim() }
              : {})
          }
        : {})
    })
  }

  const showSeparator =
    emailAndPassword?.enabled && socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.signUp}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {socialPosition === "top" && (
            <SocialSection
              socialLayout={socialLayout}
              isPending={isPending}
              showSeparator={!!showSeparator}
              orLabel={localization.auth.or}
            />
          )}

          {emailAndPassword?.enabled && (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <NameField
                  isPending={isPending}
                  error={fieldErrors.name}
                  localization={localization}
                  dispatch={dispatch}
                />

                {usernameConfig?.enabled && (
                  <UsernameField
                    username={username}
                    isPending={isPending}
                    usernameConfig={usernameConfig}
                    usernameData={usernameData}
                    usernameError={usernameError}
                    localization={localization}
                    onChange={handleUsernameChange}
                  />
                )}

                <EmailField
                  isPending={isPending}
                  error={fieldErrors.email}
                  localization={localization}
                  dispatch={dispatch}
                />

                <PasswordField
                  password={password}
                  isPending={isPending}
                  isVisible={isPasswordVisible}
                  error={fieldErrors.password}
                  emailAndPassword={emailAndPassword}
                  localization={localization}
                  dispatch={dispatch}
                />

                {emailAndPassword?.confirmPassword && (
                  <ConfirmPasswordField
                    confirmPassword={confirmPassword}
                    isPending={isPending}
                    isVisible={isConfirmPasswordVisible}
                    error={fieldErrors.confirmPassword}
                    emailAndPassword={emailAndPassword}
                    localization={localization}
                    dispatch={dispatch}
                  />
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isPending || !isPasswordPolicyValid(password)}
                  >
                    {isPending && <Spinner />}

                    {localization.auth.signUp}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}

          {socialPosition === "bottom" && (
            <SocialSection
              socialLayout={socialLayout}
              isPending={isPending}
              showSeparator={!!showSeparator}
              orLabel={localization.auth.or}
              reverse
            />
          )}
        </div>

        {emailAndPassword?.enabled && (
          <div className="flex flex-col gap-3 items-center w-full mt-4">
            <FieldDescription className="text-center">
              {localization.auth.alreadyHaveAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signIn}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type AuthContext = ReturnType<typeof useAuth>
type Localization = AuthContext["localization"]
type EmailAndPasswordConfig = AuthContext["emailAndPassword"]
type UsernameConfig = NonNullable<AuthContext["username"]>
type UsernameAvailableResult = ReturnType<typeof useIsUsernameAvailable>
type UsernameData = UsernameAvailableResult["data"]
type UsernameMutationError = UsernameAvailableResult["error"]

type SocialSectionProps = {
  socialLayout?: SocialLayout
  isPending: boolean
  showSeparator: boolean
  orLabel: string
  reverse?: boolean
}

function SocialSection({
  socialLayout,
  isPending,
  showSeparator,
  orLabel,
  reverse
}: SocialSectionProps) {
  const { socialProviders } = useAuth()
  const hasProviders = !!socialProviders && socialProviders.length > 0

  const separator = showSeparator ? (
    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs flex items-center">
      {orLabel}
    </FieldSeparator>
  ) : null

  const buttons = hasProviders ? (
    <ProviderButtons socialLayout={socialLayout} isPending={isPending} />
  ) : null

  return (
    <>
      {reverse ? separator : buttons}
      {reverse ? buttons : separator}
    </>
  )
}

type NameFieldProps = {
  isPending: boolean
  error: string | undefined
  localization: Localization
  dispatch: React.Dispatch<FormAction>
}

function NameField({ isPending, error, localization, dispatch }: NameFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <Label htmlFor="name">{localization.auth.name}</Label>

      <Input
        id="name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder={localization.auth.namePlaceholder}
        required
        disabled={isPending}
        onChange={() => {
          dispatch({ type: "setFieldError", field: "name", value: undefined })
        }}
        onInvalid={(e) => {
          e.preventDefault()

          dispatch({
            type: "setFieldError",
            field: "name",
            value: (e.target as HTMLInputElement).validationMessage
          })
        }}
        aria-invalid={!!error}
      />

      <FieldError>{error}</FieldError>
    </Field>
  )
}

type UsernameFieldProps = {
  username: string
  isPending: boolean
  usernameConfig: UsernameConfig
  usernameData: UsernameData
  usernameError: UsernameMutationError
  localization: Localization
  onChange: (value: string) => void
}

function UsernameField({
  username,
  isPending,
  usernameConfig,
  usernameData,
  usernameError,
  localization,
  onChange
}: UsernameFieldProps) {
  const invalid = !!usernameError || (usernameData && !usernameData.available)

  return (
    <Field data-invalid={invalid}>
      <Label htmlFor="username">{localization.auth.username}</Label>

      <InputGroup>
        <InputGroupInput
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder={localization.auth.usernamePlaceholder}
          required
          minLength={usernameConfig.minUsernameLength}
          maxLength={usernameConfig.maxUsernameLength}
          disabled={isPending}
          value={username}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
        />

        {usernameConfig.isUsernameAvailable && username.trim() && (
          <InputGroupAddon align="inline-end">
            {usernameData?.available ? (
              <Check className="text-foreground" />
            ) : usernameError || usernameData?.available === false ? (
              <X className="text-destructive" />
            ) : (
              <Spinner />
            )}
          </InputGroupAddon>
        )}
      </InputGroup>

      <FieldError>
        {usernameError?.error?.message ||
          usernameError?.message ||
          (usernameData?.available === false
            ? localization.auth.usernameTaken
            : null)}
      </FieldError>
    </Field>
  )
}

type EmailFieldProps = {
  isPending: boolean
  error: string | undefined
  localization: Localization
  dispatch: React.Dispatch<FormAction>
}

function EmailField({ isPending, error, localization, dispatch }: EmailFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <Label htmlFor="email">{localization.auth.email}</Label>

      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder={localization.auth.emailPlaceholder}
        required
        disabled={isPending}
        onChange={() => {
          dispatch({ type: "setFieldError", field: "email", value: undefined })
        }}
        onInvalid={(e) => {
          e.preventDefault()

          dispatch({
            type: "setFieldError",
            field: "email",
            value: (e.target as HTMLInputElement).validationMessage
          })
        }}
        aria-invalid={!!error}
      />

      <FieldError>{error}</FieldError>
    </Field>
  )
}

type PasswordFieldProps = {
  password: string
  isPending: boolean
  isVisible: boolean
  error: string | undefined
  emailAndPassword: EmailAndPasswordConfig
  localization: Localization
  dispatch: React.Dispatch<FormAction>
}

function PasswordField({
  password,
  isPending,
  isVisible,
  error,
  emailAndPassword,
  localization,
  dispatch
}: PasswordFieldProps) {
  const visibility = usePasswordRequirementsVisibility(password)

  return (
    <Field data-invalid={!!error}>
      <Label htmlFor="password">{localization.auth.password}</Label>

      <InputGroup>
        <InputGroupInput
          id="password"
          name="password"
          type={isVisible ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            dispatch({ type: "setPassword", value: e.target.value })
          }}
          onFocus={visibility.onFocus}
          onBlur={visibility.onBlur}
          aria-describedby="password-requirements"
          placeholder={localization.auth.passwordPlaceholder}
          required
          minLength={emailAndPassword?.minPasswordLength}
          maxLength={emailAndPassword?.maxPasswordLength}
          disabled={isPending}
          onInvalid={(e) => {
            e.preventDefault()

            dispatch({
              type: "setFieldError",
              field: "password",
              value: (e.target as HTMLInputElement).validationMessage
            })
          }}
          aria-invalid={!!error}
        />

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={
              isVisible
                ? localization.auth.hidePassword
                : localization.auth.showPassword
            }
            title={
              isVisible
                ? localization.auth.hidePassword
                : localization.auth.showPassword
            }
            onClick={() => {
              dispatch({ type: "togglePasswordVisibility" })
            }}
          >
            {isVisible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {visibility.shown && (
        <PasswordRequirements
          id="password-requirements"
          password={password}
          alwaysVisible
          className="mt-1"
        />
      )}

      <FieldError>{error}</FieldError>
    </Field>
  )
}

type ConfirmPasswordFieldProps = {
  confirmPassword: string
  isPending: boolean
  isVisible: boolean
  error: string | undefined
  emailAndPassword: EmailAndPasswordConfig
  localization: Localization
  dispatch: React.Dispatch<FormAction>
}

function ConfirmPasswordField({
  confirmPassword,
  isPending,
  isVisible,
  error,
  emailAndPassword,
  localization,
  dispatch
}: ConfirmPasswordFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <Label htmlFor="confirmPassword">
        {localization.auth.confirmPassword}
      </Label>

      <InputGroup>
        <InputGroupInput
          id="confirmPassword"
          name="confirmPassword"
          type={isVisible ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            dispatch({ type: "setConfirmPassword", value: e.target.value })
          }}
          placeholder={localization.auth.confirmPasswordPlaceholder}
          required
          minLength={emailAndPassword?.minPasswordLength}
          maxLength={emailAndPassword?.maxPasswordLength}
          disabled={isPending}
          onInvalid={(e) => {
            e.preventDefault()

            dispatch({
              type: "setFieldError",
              field: "confirmPassword",
              value: (e.target as HTMLInputElement).validationMessage
            })
          }}
          aria-invalid={!!error}
        />

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={
              isVisible
                ? localization.auth.hidePassword
                : localization.auth.showPassword
            }
            title={
              isVisible
                ? localization.auth.hidePassword
                : localization.auth.showPassword
            }
            onClick={() => dispatch({ type: "toggleConfirmPasswordVisibility" })}
          >
            {isVisible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <FieldError>{error}</FieldError>
    </Field>
  )
}
