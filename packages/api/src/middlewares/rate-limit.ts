import { captureException } from "@sentry/core";
import { Ratelimit } from "@upstash/ratelimit";

import { redis } from "@memora/redis";

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Stable identifier for this limiter, namespaced into the key. */
  name: string;
  /** Window length in milliseconds. */
  windowMs: number;
}

export type RateLimitResult = Awaited<ReturnType<Ratelimit["limit"]>>;

const limiters = new Map<string, Ratelimit>();
const ephemeralCache = new Map<string, number>();
const isProd = process.env.NODE_ENV === "production";
const keyPrefix = `memora:${process.env.NODE_ENV ?? "development"}`;

function getLimiter(opts: RateLimitOptions): Ratelimit {
  const cacheKey = `${opts.name}:${opts.limit}:${opts.windowMs}`;
  const existing = limiters.get(cacheKey);
  if (existing) {
    return existing;
  }
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowMs} ms`),
    prefix: `${keyPrefix}:${opts.name}`,
    ephemeralCache,
    analytics: isProd,
    timeout: 1000,
  });
  limiters.set(cacheKey, limiter);
  return limiter;
}

/**
 * Fail-closed rate limit check backed by Upstash Redis.
 *
 * On Redis error or timeout, returns `success: false` so callers reject the
 * request. The error is reported to Sentry so outages surface immediately.
 */
export async function consumeRateLimit(
  identifier: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  try {
    return await getLimiter(opts).limit(identifier);
  } catch (err) {
    captureException(err, { tags: { rateLimiter: opts.name } });
    return {
      success: false,
      limit: opts.limit,
      remaining: 0,
      reset: Date.now() + opts.windowMs,
      pending: Promise.resolve(),
    };
  }
}

export function extractClientIp(headers: Headers | undefined): string {
  if (!headers) {
    return "unknown";
  }
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const real = headers.get("x-real-ip");
  if (real) {
    return real.trim();
  }
  return "unknown";
}
