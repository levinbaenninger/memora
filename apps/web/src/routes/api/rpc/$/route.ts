import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { RequestHeadersPlugin } from "@orpc/server/plugins";
import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { appRouter } from "@memora/api/router";

// Redact long opaque-looking tokens (e.g. share tokens) from any string we log.
// We err on the side of redacting too much: any 24+ char run of url-safe
// alphanumerics is replaced. Share tokens are 32-char nanoids; nanoids used
// for entity ids are 21 chars and stay intact.
const TOKEN_RE = /[A-Za-z0-9_-]{24,}/g;

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "string") {
    return value.replace(TOKEN_RE, "[redacted]");
  }
  if (value && typeof value === "object") {
    if (seen.has(value as object)) {
      return "[circular]";
    }
    seen.add(value as object);
    if (Array.isArray(value)) {
      return value.map((v) => redact(v, seen));
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redact(v, seen);
    }
    return out;
  }
  return value;
}

const rpcHandler = new RPCHandler(appRouter, {
  plugins: [new RequestHeadersPlugin()],
  interceptors: [
    onError((error) => {
      console.error(redact(error));
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
