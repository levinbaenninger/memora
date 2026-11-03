import type * as Sentry from "@sentry/tanstackstart-react";

type DataCollection = NonNullable<
  NonNullable<Parameters<typeof Sentry.init>[0]>["dataCollection"]
>;

const SENSITIVE_KEYS = ["forwarded", "-ip", "remote-", "via", "-user"];

// Sentry v11 collects request bodies, cookies and user info by default. Keep
// the restrictive v10 behaviour so auth payloads (passwords, tokens, 2FA codes)
// and user identifiers are never sent to Sentry.
export const sentryDataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: SENSITIVE_KEYS },
    response: { deny: SENSITIVE_KEYS },
  },
  httpBodies: [],
  urlQueryParams: { deny: SENSITIVE_KEYS },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
};
