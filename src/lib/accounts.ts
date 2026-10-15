// ============================================================
// ArcadeKit — Account constants (shared by server and client)
// ============================================================

/**
 * Set in the browser when the "I'm 13 or older" box is ticked on the
 * sign-in page. The server refuses to create an account without it,
 * which covers every sign-in method (Google, code, password) in one
 * place. Short-lived: it only needs to last through sign-in.
 */
export const AGE_COOKIE = "ak_age_ok";
export const AGE_COOKIE_MAX_AGE_SECONDS = 60 * 60;

/** Code emails: digits, minutes valid, and wait before resending */
export const CODE_LENGTH = 6;
export const CODE_EXPIRES_SECONDS = 5 * 60;
export const CODE_RESEND_SECONDS = 60;

/** Stay signed in on a device this long (refreshed while in use) */
export const SESSION_DAYS = 30;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 40;

/** Shown when a code email can't be sent (daily budget or provider error) */
export const EMAIL_UNAVAILABLE_MESSAGE =
  "We can't send codes right now. Sign in with Google, or try again later.";

/**
 * Only follow same-site, path-only redirects after sign-in, so a
 * crafted ?next= link can't send someone to another site.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
