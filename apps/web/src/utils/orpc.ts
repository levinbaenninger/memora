import { createSafeClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";

import type { AppRouterClient } from "@memora/api/router";

import { createORPCBrowserClient } from "./orpc.client";

const getORPCClient = createIsomorphicFn()
  .server(async () => {
    const { createORPCServerClient } = await import("./orpc.server");
    return createORPCServerClient();
  })
  .client(() => createORPCBrowserClient());

export const client = getORPCClient() as AppRouterClient;
export const safeClient = createSafeClient(client);
export const orpc = createTanstackQueryUtils(client);
