import { Resend } from "resend";

import { env } from "@memora/env/server";

export const email = new Resend(env.RESEND_API_KEY);
