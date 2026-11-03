import { captureException } from "@sentry/core";
import type { SecondaryStorage } from "better-auth";

import { redis } from "@memora/redis";

// Better Auth <1.7 stored rate-limit entries under the same keys as JSON
// strings. Drop any non-integer value first so INCR does not fail on them.
const INCREMENT_SCRIPT = `
local current = redis.call("GET", KEYS[1])
if current and not tonumber(current) then
  redis.call("DEL", KEYS[1])
end
local value = redis.call("INCR", KEYS[1])
local ttl = tonumber(ARGV[1]) or 0
if value == 1 and ttl > 0 then
  redis.call("EXPIRE", KEYS[1], ttl)
end
return value
`;

export const redisSecondaryStorage: SecondaryStorage = {
  async get(key) {
    try {
      const value = await redis.get(key);
      if (value === null || value === undefined) {
        return null;
      }
      if (typeof value === "string") {
        return value;
      }
      return JSON.stringify(value);
    } catch (error) {
      captureException(error, { tags: { component: "auth.secondaryStorage" } });
      return null;
    }
  },

  async getAndDelete(key) {
    try {
      const value = await redis.getdel(key);
      if (value === null || value === undefined) {
        return null;
      }
      if (typeof value === "string") {
        return value;
      }
      return JSON.stringify(value);
    } catch (error) {
      captureException(error, { tags: { component: "auth.secondaryStorage" } });
      throw error;
    }
  },

  async increment(key, ttl) {
    try {
      // INCR and set the expiry only when the key is created, atomically, so
      // later increments never extend the rate-limit window.
      const value = await redis.eval<[number], number>(
        INCREMENT_SCRIPT,
        [key],
        [ttl]
      );
      return Number(value);
    } catch (error) {
      captureException(error, { tags: { component: "auth.secondaryStorage" } });
      throw error;
    }
  },

  async set(key, value, ttl) {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      if (ttl) {
        await redis.set(key, stringValue, { ex: ttl });
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      captureException(error, { tags: { component: "auth.secondaryStorage" } });
      throw error;
    }
  },

  async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      captureException(error, { tags: { component: "auth.secondaryStorage" } });
      throw error;
    }
  },
};
