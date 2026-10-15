// ============================================================
// ArcadeKit — Better Auth (server only)
// Optional accounts. Three ways in, all linked by email:
//   - Google
//   - Email code (6 digits; creates the account on first use)
//   - Email + password (must confirm the email with a code first)
// Every email the site sends is a code, except the delete-account
// confirmation, which is a link. Every account picks a public
// username; real names, photos, and Google tokens are never stored.
// See docs/ACCOUNTS_PLAN.md.
// ============================================================

import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, username } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  codeEmail,
  deleteAccountEmail,
  emailBudgetAvailable,
  sendEmail,
} from "@/lib/email";
import {
  AGE_COOKIE,
  CODE_EXPIRES_SECONDS,
  CODE_LENGTH,
  CODE_RESEND_SECONDS,
  EMAIL_UNAVAILABLE_MESSAGE,
  MIN_PASSWORD_LENGTH,
  SESSION_DAYS,
} from "@/lib/accounts";
import {
  USERNAME_CHANGE_DAYS,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  usernameError,
} from "@/lib/usernames";
import { clearUsernameHold, holdReleasedUsername, isUsernameHeld } from "@/lib/usernames/holds";

const DAY_SECONDS = 60 * 60 * 24;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Requests that email a code. Better Auth swallows errors thrown while
// sending (it logs them and still answers "success"), so anything the
// player needs to see is checked in a before-hook instead, which stops
// the request before a code is even created.
const CODE_EMAIL_PATHS = new Set([
  "/email-otp/send-verification-otp",
  "/email-otp/request-password-reset",
  "/sign-up/email",
]);

// Per-email resend cooldown (Better Auth has none built in). The clock
// starts when a code is actually emailed, so a request that fails first
// (typo, too-short password) doesn't lock the player out for a minute.
// In memory: fine for a single web container.
const lastCodeSentAt = new Map<string, number>();

function checkCodeRequest(email: string): void {
  if (!emailBudgetAvailable()) {
    throw new APIError("SERVICE_UNAVAILABLE", { message: EMAIL_UNAVAILABLE_MESSAGE });
  }
  const now = Date.now();
  for (const [key, at] of lastCodeSentAt) {
    if (now - at > CODE_RESEND_SECONDS * 1000) lastCodeSentAt.delete(key);
  }
  const previous = lastCodeSentAt.get(email);
  if (previous && now - previous < CODE_RESEND_SECONDS * 1000) {
    throw new APIError("TOO_MANY_REQUESTS", {
      message: "We just sent a code to that email. Wait a minute before asking for another.",
    });
  }
}

export const auth = betterAuth({
  appName: "ArcadeKit",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, { provider: "pg", schema }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    // Accounts link by email, so a password account must prove the
    // email is theirs before it can be used
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account",
            // Only the email address: no name or profile photo
            disableDefaultScope: true,
            scope: ["openid", "email"],
            mapProfileToUser: () => ({ name: "" }),
          },
        }
      : {},

  account: {
    // Same email = same account, whichever way someone signs in.
    // Google emails count as verified; password emails are verified
    // by code before the account works.
    accountLinking: { enabled: true },
  },

  user: {
    additionalFields: {
      ageConfirmedAt: { type: "date", required: false, input: false },
      usernameChangedAt: { type: "date", required: false, input: false },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendEmail(deleteAccountEmail(user.email, url));
      },
      // Hold the username so nobody can take it right away. The hold's
      // owner link is cleared when the account row is deleted.
      beforeDelete: async (user) => {
        const [row] = await db
          .select({ username: schema.user.username })
          .from(schema.user)
          .where(eq(schema.user.id, user.id));
        if (row?.username) await holdReleasedUsername(row.username, user.id);
      },
    },
  },

  session: {
    expiresIn: SESSION_DAYS * DAY_SECONDS,
    updateAge: DAY_SECONDS,
    // The header checks the session on every page; this signed cookie
    // answers most of those checks without touching the database
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          if (ctx?.getCookie(AGE_COOKIE) !== "1") {
            throw new APIError("FORBIDDEN", {
              message: "Please confirm you're 13 or older to create an account.",
            });
          }
          // Never store a real name or photo, whatever the sign-in method sent
          return { data: { ...user, name: "", image: null, ageConfirmedAt: new Date() } };
        },
      },
      update: {
        before: async (data, ctx) => {
          // Names and photos are never stored. Better Auth merges the
          // returned data into the update, so overwrite rather than delete.
          const rest = { ...data };
          if ("name" in rest) rest.name = "";
          if ("image" in rest) rest.image = null;

          if (typeof rest.username !== "string") return { data: rest };

          const userId = ctx?.context.session?.user.id;
          if (!userId) return { data: rest };
          const wanted = rest.username.toLowerCase();
          const [current] = await db
            .select({ username: schema.user.username, changedAt: schema.user.usernameChangedAt })
            .from(schema.user)
            .where(eq(schema.user.id, userId));

          // Only capitals changed: same name, nothing to check
          if (current?.username === wanted) return { data: rest };

          // Recently released by someone else (renamed or deleted account)
          if (await isUsernameHeld(wanted, userId)) {
            throw new APIError("BAD_REQUEST", {
              message: "That username isn't available yet. Try another.",
            });
          }

          // First pick is free; after that, one change per USERNAME_CHANGE_DAYS
          if (!current?.username) {
            await clearUsernameHold(wanted);
            return { data: rest };
          }
          const waitMs = USERNAME_CHANGE_DAYS * DAY_SECONDS * 1000;
          if (current.changedAt && Date.now() - current.changedAt.getTime() < waitMs) {
            const nextChange = new Date(current.changedAt.getTime() + waitMs);
            throw new APIError("BAD_REQUEST", {
              message: `You can change your username again on ${nextChange.toLocaleDateString("en-US", { month: "long", day: "numeric" })}.`,
            });
          }
          // Taking back your own held name ends its hold; the name being
          // given up is held for everyone else
          await clearUsernameHold(wanted);
          await holdReleasedUsername(current.username, userId);
          return { data: { ...rest, usernameChangedAt: new Date() } };
        },
      },
    },
    account: {
      // We never call Google's APIs, so don't keep its tokens (the ID
      // token would also carry the person's name and photo)
      create: {
        before: async (account) => ({
          data: { ...account, accessToken: null, refreshToken: null, idToken: null },
        }),
      },
      update: {
        before: async (account) => ({
          data: { ...account, accessToken: null, refreshToken: null, idToken: null },
        }),
      },
    },
  },

  rateLimit: {
    // Per IP. A whole school can share one IP, so these are loose; the
    // per-email cooldown and the daily email budget do the real limiting.
    customRules: {
      "/get-session": false,
      "/email-otp/send-verification-otp": { window: 600, max: 10 },
      "/email-otp/request-password-reset": { window: 600, max: 10 },
      "/sign-in/email-otp": { window: 60, max: 10 },
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 600, max: 10 },
    },
  },

  // Sign-in is by email only; usernames are just public names
  disabledPaths: ["/sign-in/username"],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!CODE_EMAIL_PATHS.has(ctx.path)) return;
      const email = typeof ctx.body?.email === "string" ? ctx.body.email.trim().toLowerCase() : "";
      if (email) checkCodeRequest(email);
    }),
  },

  advanced: {
    // nginx sets X-Real-IP to the connecting address; X-Forwarded-For
    // can carry client-supplied values
    ipAddress: { ipAddressHeaders: ["x-real-ip"] },
  },

  plugins: [
    emailOTP({
      otpLength: CODE_LENGTH,
      expiresIn: CODE_EXPIRES_SECONDS,
      allowedAttempts: 3,
      // "Send a new code" re-sends the same code while it's valid, so a
      // slow first email still works
      resendStrategy: "reuse",
      // Encrypted at rest in production; plain in dev so codes can be read
      // from the local database while testing without Resend
      storeOTP: process.env.NODE_ENV === "production" ? "encrypted" : "plain",
      // Password sign-ups get a code instead of a verification link
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "change-email") return; // not offered on ArcadeKit
        // Failures here are logged by Better Auth and alerted on Discord by
        // sendEmail; the player-facing limits run earlier (hooks.before)
        lastCodeSentAt.set(email.toLowerCase(), Date.now());
        await sendEmail(codeEmail(email, otp, type));
      },
    }),
    username({
      minUsernameLength: USERNAME_MIN_LENGTH,
      maxUsernameLength: USERNAME_MAX_LENGTH,
      usernameValidator: (value) => usernameError(value) === null,
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
