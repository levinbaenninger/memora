import { authMiddleware } from "../middlewares/auth";
import { globalRateLimitMiddleware } from "../middlewares/global-rate-limit";
import { base } from "./base";

export const authorized = base
  .use(authMiddleware)
  .use(globalRateLimitMiddleware);
