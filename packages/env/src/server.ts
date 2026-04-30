import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const runtimeEnv = {
  ...process.env,
  SENTRY_DSN: process.env.VITE_SENTRY_DSN,
};

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_API_KEY: z.string().min(1),
    OAUTH_PROXY_SECRET: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    SENTRY_AUTH_TOKEN: z.string().min(1),
    SENTRY_DSN: z.string().min(1),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
});
