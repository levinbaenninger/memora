import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SENTRY_DSN: z.string().min(1),
  },
  runtimeEnv: {
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  },
  emptyStringAsUndefined: true,
});
