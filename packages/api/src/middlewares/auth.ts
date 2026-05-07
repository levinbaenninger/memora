import { auth } from "@memora/auth";

import { base } from "../procedures/base";

export const authMiddleware = base
  .errors({
    UNAUTHORIZED: {},
  })
  .middleware(async ({ context, next, errors }) => {
    const sessionData = await auth.api.getSession({
      headers: context.reqHeaders ?? new Headers(),
    });

    if (!(sessionData?.session && sessionData?.user)) {
      throw errors.UNAUTHORIZED();
    }

    return next({
      context: {
        session: sessionData.session,
        user: sessionData.user,
      },
    });
  });
