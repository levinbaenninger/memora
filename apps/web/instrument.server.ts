import * as Sentry from "@sentry/tanstackstart-react";

import { env } from "@memora/env/server";

Sentry.init({
  dsn: env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
});
