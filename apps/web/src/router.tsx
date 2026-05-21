import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import "./index.css";
import { QueryClient } from "@tanstack/react-query";

import { env } from "@memora/env/client";

import { RouteSkeleton } from "./components/route-skeleton";
import { routeTree } from "./routeTree.gen";
import { orpc } from "./utils/orpc";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });

  const router = createTanStackRouter({
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
    defaultPendingMs: 0,
    defaultPendingMinMs: 300,
    defaultViewTransition: true,
    defaultPendingComponent: RouteSkeleton,
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
      enabled: process.env.NODE_ENV === "production",
    });
  }

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
