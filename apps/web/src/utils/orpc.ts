import { createContext } from "@memora/api/context";
import { appRouter } from "@memora/api/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { toast } from "sonner";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30_000,
      },
    },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.options.mutationKey?.[0] === "auth") {
          return;
        }
        if (typeof window === "undefined") {
          return;
        }
        toast.error(error.message);
      },
    }),
  });
}

const getORPCClient = createIsomorphicFn()
  .server(() => {
    return createRouterClient(appRouter, {
      context: async () => {
        return await createContext({ req: getRequest() });
      },
    });
  })
  .client((): RouterClient<typeof appRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  });

export const client: RouterClient<typeof appRouter> = getORPCClient();
export const orpc = createTanstackQueryUtils(client);
