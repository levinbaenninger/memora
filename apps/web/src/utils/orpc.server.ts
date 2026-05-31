import { createRouterClient } from "@orpc/server";
import { getRequestHeaders } from "@tanstack/react-start/server";

import type { AppRouterClient } from "@memora/api/router";
import { appRouter } from "@memora/api/router";

export function createORPCServerClient(): AppRouterClient {
  return createRouterClient(appRouter, {
    context: async () => ({
      reqHeaders: getRequestHeaders(),
    }),
  });
}
