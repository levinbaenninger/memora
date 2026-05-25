"use server";

import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "@memora/db";
import * as schema from "@memora/db/schema/auth";
import { env } from "@memora/env/server";

import {
  sendChangeEmailConfirmation,
  sendPasswordChangedEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./emails";
import { redisSecondaryStorage } from "./redis-secondary-storage";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    autoSignInAfterVerification: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ newEmail, url }) => {
        await sendChangeEmailConfirmation(newEmail, url);
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/change-password") {
        const session = ctx.context.session;
        if (session?.user?.email) {
          await sendPasswordChangedEmail(session.user.email);
        }
      }
    }),
  },
  secondaryStorage: redisSecondaryStorage,
  // Keep sessions + verification tokens in Postgres alongside Redis. Without
  // these flags Better Auth strips both tables from its internal schema when
  // `secondaryStorage` is set (see @better-auth/core/db/get-tables), which
  // breaks any path that does `getDefaultModelName("session")`. Redis still
  // acts as a session cache; the DB remains the source of truth.
  session: { storeSessionInDatabase: true },
  verification: { storeInDatabase: true },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60 * 60, max: 10 },
      "/forget-password": { window: 60 * 60, max: 5 },
      "/reset-password": { window: 60 * 60, max: 5 },
      "/two-factor/*": { window: 60, max: 5 },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: {
    allowedHosts: [
      "memora.baenninger.me",
      "memora-*-levexis.vercel.app",
      "unquick-unarticulative-arlene.ngrok-free.dev",
      "localhost:3000",
    ],
    fallback: "https://memora.baenninger.me",
    protocol: process.env.NODE_ENV === "development" ? "https" : "https",
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    tanstackStartCookies(),
    oAuthProxy({
      productionURL: "https://memora.baenninger.me",
      secret: env.OAUTH_PROXY_SECRET ?? env.BETTER_AUTH_SECRET,
    }),
    dash(),
  ],
});
