# Accounts — Plan (feat/accounts)

Agreed with Mark on 2026-10-13. Nothing here is built yet.

## Scope

Optional accounts. Every game stays fully playable without one, and guests
joining a room never need an account. Accounts launch together with the
first feature that uses them (daily-game streak sync), so there's no launch
switch: the branch simply isn't merged until then.

Not in this branch: payments, Plus, stats, connecting accounts to the game
server.

## Sign-in methods (all linked by email into one account)

| Method | Flow | Emails sent |
|---|---|---|
| Continue with Google (main button) | Google OAuth | 0 |
| Email code (main email option) | email → 6-digit code → signed in; creates the account on first use | 1 per sign-in |
| Email + password | sign up → 6-digit verification code → signed in | 1 at sign-up |

- Codes are used for every email: sign-in, verification, password reset.
  Better Auth defaults: 6 digits, 5-minute expiry, 3 attempts.
- Password accounts must verify their email with the code before they work.
  Required because accounts link by email: without it, someone could
  create a password account with another person's email and keep access
  after that person signs in with Google.
- Someone who started with a code or Google can add a password later from
  the account page.
- "I'm 13 or older" checkbox before any sign-in method. No date of birth.
  Ticking it sets a 1-hour cookie; the server refuses to create any account
  (Google, code, or password) without it and records ageConfirmedAt.

## Usernames (added 2026-10-13)

- Every account has a public username, required right after the first
  sign-in (/welcome), prefilled with a random suggestion ("SwiftOtter482").
- It's the only name other players see. Real names and photos are never
  stored: Google is asked only for the email (openid + email scopes), name and
  image are blanked on create/update, and Google tokens aren't kept.
- Rules: 3–20 letters, numbers, underscores; unique ignoring case; blocklist
  (two tiers, based on TerraVia's) plus reserved names; one change per 30
  days (the first pick doesn't start the clock).
- Sign-in stays by email; username sign-in is disabled.
- Delete account: signed in, then confirmed by a link emailed to them
  (Better Auth's deleteUser verification). Immediate and permanent.

## Keeping email volume low (Resend free plan: 100/day, 3,000/month)

Shared Resend account with TerraVia (it sends ~2 emails/month). Add
arcadekit.games as a domain, with its own API key restricted to that domain.

1. Sessions last 30 days on a device (Better Auth default is 7), so returning
   players rarely need a new code.
2. Google is the main sign-in button; it sends no email.
3. Abuse limits on code requests: one per email per minute, and a loose
   per-IP limit (10 per 10 minutes; a whole school can share one IP). A daily
   budget stops sending at 95 emails, so the account can't be pushed past
   Resend's 100/day.
4. If a send fails (quota hit or Resend error): the sign-in screen says
   "We can't send codes right now. Sign in with Google, or try again
   later." Games are never affected.
5. Alerts to the existing Discord webhook: when sends start failing, and an
   early warning around 80 emails in a day.

When the limit is reached for real: upgrade the Resend account (TerraVia
benefits too). No code changes needed.

## Stack (pin exact versions)

- better-auth 1.7.7, @better-auth/drizzle-adapter 1.7.7
- drizzle-orm 0.45.4, pg 8.23.1, drizzle-kit 0.31.11 (dev), @types/pg (dev)
- resend 6.32.1
- Plugins: emailOTP (codes), nextCookies (last in the list)

## Files

- `docker/docker-compose.yml` — `postgres:17-alpine`, internal network only,
  volume + health check; web gets `DATABASE_URL`. Redis unchanged.
- Dev Postgres via a small compose file on port 5433 (WSL's own Postgres 14
  already uses 5432).
- `src/lib/db/` (connection + generated schema), `drizzle.config.ts`,
  `drizzle/` migrations.
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/email.ts`,
  `src/app/api/auth/[...all]/route.ts`.
- Pages (phone-first, noindex): `/sign-in` (Google, code, or password),
  `/forgot-password`, `/account` (name, email, add password, sign out,
  delete account).
- Header: sign-in / account link.
- Privacy policy and terms updated for accounts, Google sign-in, Resend,
  and deletion.
- `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`,
  `DISCORD_ALERT_WEBHOOK_URL` (or reuse the feedback webhook).

## Deploy

One extra step before restarting the site: run the database migration
(creates the tables the first time, applies changes later). Exact commands
go in the deploy notes. Nothing runs automatically.

## Mark's to-dos (when we get there)

1. Install packages in the worktree via WSL (commands provided then).
2. Add arcadekit.games to the existing Resend account (DNS records), create
   a domain-restricted API key, put it in the worktree's `.env.local`.
3. Create a Google OAuth web client (steps provided then). Redirect URIs:
   `http://localhost:3000/api/auth/callback/google` and
   `https://arcadekit.games/api/auth/callback/google` (plus the worktree's
   dev port if both dev servers run at once).

Claude copies `.env.local` into the worktree and generates the local-only
`BETTER_AUTH_SECRET`.
