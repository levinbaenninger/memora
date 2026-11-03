import * as Sentry from "@sentry/tanstackstart-react";

import { env } from "@memora/env/server";

import { sentryDataCollection } from "./src/utils/sentry-data-collection";

Sentry.init({
  dsn: env.SENTRY_DSN,
  dataCollection: sentryDataCollection,
  enabled: process.env.NODE_ENV === "production",
});
