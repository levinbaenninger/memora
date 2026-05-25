import { Redis } from "@upstash/redis";

import { env } from "@memora/env/server";

export const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export { Redis } from "@upstash/redis";
