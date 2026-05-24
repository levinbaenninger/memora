interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  if (buckets.size < 1024) {
    return;
  }
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitOptions {
  /** Stable identifier for this limiter, namespaced into the key. */
  name: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/** Returns true if the request is within budget, false if it exceeded the limit. */
export function consumeRateLimit(
  identifier: string,
  opts: RateLimitOptions
): boolean {
  const now = Date.now();
  sweep(now);
  const key = `${opts.name}:${identifier}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }

  if (bucket.count >= opts.limit) {
    return false;
  }

  bucket.count += 1;
  return true;
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
