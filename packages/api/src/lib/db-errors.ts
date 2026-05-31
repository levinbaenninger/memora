export function isUniqueViolation(error: unknown, constraint: string): boolean {
  let current: unknown = error;

  while (current && typeof current === "object") {
    const record = current as {
      code?: string;
      constraint?: string;
      cause?: unknown;
    };

    if (
      record.code === "23505" &&
      (!record.constraint || record.constraint === constraint)
    ) {
      return true;
    }

    current = record.cause;
  }

  return false;
}
