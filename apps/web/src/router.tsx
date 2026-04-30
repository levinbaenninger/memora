import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import "./index.css";
import { env } from "@memora/env/client";
import { routeTree } from "./routeTree.gen";
import { createAppQueryClient, orpc } from "./utils/orpc";

export const getRouter = () => {
  const queryClient = createAppQueryClient();

  const router = createTanStackRouter({
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
    context: { queryClient, orpc },
  });

  setupRouterSsrQueryIntegration({
    queryClient,
    router,
  });

  if (!router.isServer) {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,
      sendDefaultPii: true,
    });
  }

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
