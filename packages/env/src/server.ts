import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../apps/web/.env") });

const formatEnvIssuePath = (
  path: readonly (PropertyKey | { key: PropertyKey })[]
) =>
  path
    .map((segment) =>
      typeof segment === "object" && segment !== null && "key" in segment
        ? String(segment.key)
        : String(segment)
    )
    .join(".");

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    OAUTH_PROXY_SECRET: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    const details = issues
      .map((issue) => {
        const variable = issue.path?.length
          ? formatEnvIssuePath(issue.path)
          : "unknown";

        return `${variable}: ${issue.message}`;
      })
      .join("; ");

    throw new Error(`Invalid environment variables: ${details}`);
  },
});
