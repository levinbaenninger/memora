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

const ERROR_RESERVED_KEYS = new Set(["name", "message", "stack", "cause"]);

function redactString(value: string): string {
  return value.replace(TOKEN_RE, "[redacted]");
}

function redactArray(value: unknown[], seen: WeakSet<object>): unknown[] {
  return value.map((v) => redact(v, seen));
}

function redactPlainObject(
  value: Record<string, unknown>,
  seen: WeakSet<object>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = redact(v, seen);
  }
  return out;
}

// Error instances expose name/message/stack as non-enumerable properties,
// which Object.entries skips — produce a plain object that preserves them
// (plus any custom enumerable own props like `code`, `data`, `cause`).
function redactError(
  err: Error & { cause?: unknown },
  seen: WeakSet<object>
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: err.name,
    message: redact(err.message, seen),
  };
  if (err.stack) {
    out.stack = redact(err.stack, seen);
  }
  if (err.cause !== undefined) {
    out.cause = redact(err.cause, seen);
  }
  const bag = err as unknown as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(err)) {
    if (ERROR_RESERVED_KEYS.has(key)) {
      continue;
    }
    out[key] = redact(bag[key], seen);
  }
  return out;
}

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }
  if (!(value && typeof value === "object")) {
    return value;
  }
  if (seen.has(value as object)) {
    return "[circular]";
  }
  seen.add(value as object);
  if (Array.isArray(value)) {
    return redactArray(value, seen);
  }
  if (value instanceof Error) {
    return redactError(value as Error & { cause?: unknown }, seen);
  }
  return redactPlainObject(value as Record<string, unknown>, seen);
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
