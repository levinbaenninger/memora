import { captureException } from "@sentry/core";
import type { SecondaryStorage } from "better-auth";

import { redis } from "@memora/redis";

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
