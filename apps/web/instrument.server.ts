import { env } from "@memora/env/server";
import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  dsn: env.SENTRY_DSN,
  sendDefaultPii: true,
});
