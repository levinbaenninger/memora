export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

const UPPERCASE_RE = /[A-Z]/;
const LOWERCASE_RE = /[a-z]/;
const DIGIT_RE = /[0-9]/;
const SYMBOL_RE = /[^A-Za-z0-9]/;

export type PasswordRuleId =
  | "length"
  | "uppercase"
  | "lowercase"
  | "digit"
  | "symbol";

export interface PasswordRule {
  id: PasswordRuleId;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (password) =>
      password.length >= MIN_PASSWORD_LENGTH &&
      password.length <= MAX_PASSWORD_LENGTH,
  },
  {
    id: "uppercase",
    label: "An uppercase letter (A-Z)",
    test: (password) => UPPERCASE_RE.test(password),
  },
  {
    id: "lowercase",
    label: "A lowercase letter (a-z)",
    test: (password) => LOWERCASE_RE.test(password),
  },
  {
    id: "digit",
    label: "A digit (0-9)",
    test: (password) => DIGIT_RE.test(password),
  },
  {
    id: "symbol",
    label: "A symbol (anything not a letter or digit)",
    test: (password) => SYMBOL_RE.test(password),
  },
];

export interface PasswordPolicyResult {
  failed: PasswordRuleId[];
  valid: boolean;
}

export function evaluatePassword(password: string): PasswordPolicyResult {
  const failed: PasswordRuleId[] = [];

  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      failed.push(rule.id);
    }
  }

  return { valid: failed.length === 0, failed };
}

export function describePolicyFailure(failed: PasswordRuleId[]): string {
  if (failed.length === 0) {
    return "Password does not meet the policy.";
  }

  const labels = failed.map(
    (id) => PASSWORD_RULES.find((rule) => rule.id === id)?.label ?? id
  );

  return `Password must include: ${labels.join(", ")}.`;
}
