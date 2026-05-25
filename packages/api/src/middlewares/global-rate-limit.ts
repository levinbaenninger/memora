import { base } from "../procedures/base";
import { consumeRateLimit } from "./rate-limit";

const GLOBAL_USER_RATE_LIMIT = {
  name: "global.user",
  limit: 300,
  windowMs: 60 * 1000,
};

export const globalRateLimitMiddleware = base
  .errors({
    TOO_MANY_REQUESTS: {
      message: "Too many requests. Try again later.",
    },
  })
  .middleware(async ({ context, next, errors }) => {
    const userId = (context as { user?: { id: string } }).user?.id;
    if (!userId) {
      return next();
    }
    const rl = await consumeRateLimit(userId, GLOBAL_USER_RATE_LIMIT);
    if (!rl.success) {
      throw errors.TOO_MANY_REQUESTS({});
    }
    return next();
  });
