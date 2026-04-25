import { env } from "@memora/env/server";
import { Resend } from "resend";

export const email = new Resend(env.RESEND_API_KEY);
