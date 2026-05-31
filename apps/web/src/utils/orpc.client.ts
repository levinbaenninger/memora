import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

import type { AppRouterClient } from "@memora/api/router";

export function createORPCBrowserClient(): AppRouterClient {
  const link = new RPCLink({
    url: `${window.location.origin}/api/rpc`,
  });

  return createORPCClient(link);
}
