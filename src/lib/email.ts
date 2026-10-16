// ============================================================
// ArcadeKit — Transactional email (server only)
// Sends account emails through Resend. Without RESEND_API_KEY
// (local dev) the email is printed to the Next.js console instead.
//
// The Resend free plan allows 100 emails a day (shared with other
// projects on the account), so this keeps a daily count: it warns
// on Discord at WARN_AT and refuses to send past DAILY_BUDGET, so
// abuse can't push the account over its limit. The count lives in
// memory and resets on restart or at midnight UTC.
// ============================================================

import { Resend } from "resend";
import { sendAlert } from "./alerts";

const WARN_AT = 80;
const DAILY_BUDGET = 95;

const FROM = process.env.EMAIL_FROM || "ArcadeKit <no-reply@arcadekit.games>";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

let countDay = "";
let countToday = 0;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function rollDay(): void {
  if (countDay !== today()) {
    countDay = today();
    countToday = 0;
  }
}

/** False once today's budget is used up (checked before creating a code). */
export function emailBudgetAvailable(): boolean {
  rollDay();
  return countToday < DAILY_BUDGET;
}

/** Thrown when an email can't be sent (budget reached or provider error). */
export class EmailUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "EmailUnavailableError";
  }
}

interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(email: Email): Promise<void> {
  rollDay();

  if (countToday >= DAILY_BUDGET) {
    void sendAlert(
      "email-budget",
      `Daily email budget (${DAILY_BUDGET}) reached. Code sign-ins are paused until midnight UTC; Google sign-in still works.`,
    );
    throw new EmailUnavailableError("daily budget reached");
  }

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      void sendAlert("email-config", "RESEND_API_KEY is not set, so account emails can't be sent.");
      throw new EmailUnavailableError("email not configured");
    }
    console.log(`[ArcadeKit] Email (no RESEND_API_KEY) to ${email.to}: ${email.subject}\n${email.text}`);
    countToday += 1;
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (error) {
    console.error("[ArcadeKit] Resend error:", error);
    void sendAlert("email-failed", `Resend refused an email (${error.name}): ${error.message}`);
    throw new EmailUnavailableError(error.name);
  }

  countToday += 1;
  if (countToday === WARN_AT) {
    void sendAlert(
      "email-warning",
      `${WARN_AT} account emails sent today (Resend free plan: 100/day, shared with TerraVia).`,
    );
  }
}

// ── Templates ───────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#0b0d17;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#f0f0f5;">
    <div style="max-width:440px;margin:0 auto;background:#12152a;border-radius:16px;padding:28px;">
      <p style="margin:0 0 16px;font-weight:700;color:#f97316;">ArcadeKit</p>
      <h1 style="margin:0 0 12px;font-size:20px;">${heading}</h1>
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#8b8fa3;">If you didn't ask for this, you can ignore this email.</p>
    </div>
  </body>
</html>`;
}

export type CodePurpose = "sign-in" | "email-verification" | "forget-password";

const CODE_COPY: Record<CodePurpose, { subject: string; heading: string; line: string }> = {
  "sign-in": {
    subject: "Your ArcadeKit sign-in code",
    heading: "Your sign-in code",
    line: "Enter this code to sign in to ArcadeKit.",
  },
  "email-verification": {
    subject: "Confirm your email for ArcadeKit",
    heading: "Confirm your email",
    line: "Enter this code to confirm your email and finish creating your account.",
  },
  "forget-password": {
    subject: "Reset your ArcadeKit password",
    heading: "Reset your password",
    line: "Enter this code to choose a new password.",
  },
};

export function codeEmail(to: string, code: string, purpose: CodePurpose): Email {
  const copy = CODE_COPY[purpose];
  return {
    to,
    subject: copy.subject,
    text: `${copy.line}\n\n${code}\n\nThe code expires in 5 minutes.\n\nIf you didn't ask for this, you can ignore this email.`,
    html: layout(
      copy.heading,
      `<p style="margin:0 0 16px;color:#c9cbd6;">${copy.line}</p>
      <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;">${escapeHtml(code)}</p>
      <p style="margin:0;font-size:13px;color:#8b8fa3;">The code expires in 5 minutes.</p>`,
    ),
  };
}

export function deleteAccountEmail(to: string, url: string): Email {
  return {
    to,
    subject: "Confirm deleting your ArcadeKit account",
    text: `Open this link to confirm deleting your ArcadeKit account:\n\n${url}\n\nYou'll be asked to confirm, and it can't be undone. If you didn't ask for this, ignore this email and your account stays as it is.`,
    html: layout(
      "Delete your account?",
      `<p style="margin:0 0 16px;color:#c9cbd6;">Open the link below to confirm deleting your ArcadeKit account. You'll be asked to confirm, and it can't be undone.</p>
      <p style="margin:0 0 16px;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;font-weight:600;padding:10px 16px;border-radius:8px;">Delete my account</a></p>
      <p style="margin:0;font-size:13px;color:#8b8fa3;">If you didn't ask for this, your account stays as it is.</p>`,
    ),
  };
}
