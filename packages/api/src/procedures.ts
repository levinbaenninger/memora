import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

export const authMiddleware = o.middleware(({ context, next }) => {
  if (!context.auth?.user) {
    throw new ORPCError("Unauthorized");
  }

  return next({
    context: {
      session: context.auth.session,
      user: context.auth.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(authMiddleware);
