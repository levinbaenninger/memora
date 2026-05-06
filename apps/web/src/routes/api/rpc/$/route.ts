import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { RequestHeadersPlugin } from "@orpc/server/plugins";
import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { appRouter } from "@memora/api/router";

const rpcHandler = new RPCHandler(appRouter, {
  plugins: [new RequestHeadersPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await rpcHandler.handle(request, {
          prefix: "/api/rpc",
          context: async () => ({
            reqHeaders: getRequestHeaders(),
          }),
        });

        return response ?? new Response("Not found", { status: 404 });
      },
    },
  },
});
