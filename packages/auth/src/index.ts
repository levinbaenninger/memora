"use server";

import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { deleteSessionCookie } from "better-auth/cookies";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import { twoFactor } from "better-auth/plugins/two-factor";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "@memora/db";
import * as schema from "@memora/db/schema/auth";
import { env } from "@memora/env/server";
import {
  describePolicyFailure,
  evaluatePassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@memora/ui/lib/password-policy";

import {
  sendChangeEmailConfirmation,
  sendPasswordChangedEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./emails";
import { redisSecondaryStorage } from "./redis-secondary-storage";

const POLICY_PATHS: Record<string, "password" | "newPassword"> = {
  "/sign-up/email": "password",
  "/change-password": "newPassword",
  "/reset-password": "newPassword",
};

export const auth = betterAuth({
  appName: "Memora",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: MAX_PASSWORD_LENGTH,
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
    // biome-ignore lint/suspicious/useAwait: createAuthMiddleware requires an async handler
    before: createAuthMiddleware(async (ctx) => {
      const passwordField = ctx.path ? POLICY_PATHS[ctx.path] : undefined;
      if (!passwordField) {
        return;
      }

      const body = ctx.body as Record<string, unknown> | undefined;
      const password = body?.[passwordField];
      if (typeof password !== "string") {
        return;
      }

      const result = evaluatePassword(password);
      if (!result.valid) {
        throw new APIError("BAD_REQUEST", {
          code: "PASSWORD_POLICY_VIOLATION",
          message: describePolicyFailure(result.failed),
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/change-password") {
        const session = ctx.context.session;
        if (session?.user?.email) {
          await sendPasswordChangedEmail(session.user.email);
        }
        return;
      }

      // OAuth/social sign-in does not natively trigger Better Auth's 2FA
      // challenge. Mirror the plugin's `/sign-in/email` after-hook for the
      // OAuth callback paths so users with 2FA enabled get the same
      // challenge regardless of how they signed in.
      if (
        ctx.path === "/callback/:id" ||
        ctx.path === "/oauth-proxy-callback"
      ) {
        const newSession = ctx.context.newSession;
        if (!newSession?.user.twoFactorEnabled) {
          return;
        }

        deleteSessionCookie(ctx, true);
        await ctx.context.internalAdapter.deleteSession(
          newSession.session.token
        );

        const maxAge = 600;
        const twoFactorCookie = ctx.context.createAuthCookie("two_factor", {
          maxAge,
        });
        const identifier = `2fa-${crypto.randomUUID().replace(/-/g, "")}`;
        await ctx.context.internalAdapter.createVerificationValue({
          value: newSession.user.id,
          identifier,
          expiresAt: new Date(Date.now() + maxAge * 1000),
        });
        await ctx.setSignedCookie(
          twoFactorCookie.name,
          identifier,
          ctx.context.secret,
          twoFactorCookie.attributes
        );

        throw ctx.redirect("/auth/two-factor");
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
      "localhost:3000",
    ],
    fallback: "https://memora.baenninger.me",
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
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
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "This password appeared in a known data breach. Pick another.",
    }),
    twoFactor({
      issuer: "Memora",
      allowPasswordless: true,
      backupCodeOptions: {
        storeBackupCodes: "encrypted",
      },
    }),
    dash(),
  ],
});
