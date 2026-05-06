import { createORPCClient, createSafeClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { appRouter } from "@memora/api/router";

const getORPCClient = createIsomorphicFn()
  .server(() => {
    return createRouterClient(appRouter, {
      context: async () => ({
        reqHeaders: getRequestHeaders(),
      }),
    });
  })
  .client((): RouterClient<typeof appRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
    });

    return createORPCClient(link);
  });

const client: RouterClient<typeof appRouter> = getORPCClient();
const safeClient = createSafeClient(client);
export const orpc = createTanstackQueryUtils(safeClient);
