"use client";

// ============================================================
// ArcadeKit — Sign-in flow
// Steps: start (Google / email code) → code
//        password → (forgot → reset) | (create → verify)
// Every email step uses a 6-digit code.
// ============================================================

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/account/PasswordInput";
import { trackEvent } from "@/lib/analytics";
import {
  AGE_COOKIE,
  AGE_COOKIE_MAX_AGE_SECONDS,
  CODE_LENGTH,
  CODE_RESEND_SECONDS,
  MIN_PASSWORD_LENGTH,
} from "@/lib/accounts";

type Step = "start" | "code" | "password" | "create" | "verify" | "forgot" | "reset";

interface AuthError {
  code?: string;
  message?: string;
  status?: number;
}

/** Friendlier text for Better Auth's error codes; falls back to its message. */
function describeError(error: AuthError | null | undefined): string {
  if (!error) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "INVALID_OTP":
      return "That code isn't right. Check the email and try again.";
    case "OTP_EXPIRED":
      return "That code has expired. Ask for a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many wrong tries. Ask for a new code.";
    case "INVALID_EMAIL_OR_PASSWORD":
      return "That email and password don't match.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "There's already an account with that email. Sign in with a code, then add a password from your account page.";
    case "PASSWORD_TOO_SHORT":
      return `Passwords need at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "INVALID_EMAIL":
      return "That doesn't look like an email address.";
  }
  if (error.status === 429 && !error.message) return "Too many tries. Wait a minute and try again.";
  return error.message || "Something went wrong. Please try again.";
}

function setAgeCookie(confirmed: boolean) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = confirmed
    ? `${AGE_COOKIE}=1; Max-Age=${AGE_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
    : `${AGE_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}

function hasAgeCookie(): boolean {
  return document.cookie.split("; ").some((c) => c === `${AGE_COOKIE}=1`);
}

/** True when the account was created in the last minute (i.e. by this sign-in). */
function isNewAccount(createdAt: Date | string | undefined): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 60_000;
}

// ── Small UI pieces ─────────────────────────────────────────

const inputClass =
  "h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-base text-foreground placeholder:text-text-muted focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember";

function PrimaryButton({ busy, disabled, children }: { busy: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-ember font-semibold text-white transition-colors hover:bg-ember/90 disabled:cursor-default disabled:opacity-50"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function TextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer text-sm font-medium text-ember underline-offset-4 hover:underline"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-text-secondary hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function CodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
      placeholder={"0".repeat(CODE_LENGTH)}
      aria-label={`${CODE_LENGTH}-digit code`}
      className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
    />
  );
}

// ── Flow ────────────────────────────────────────────────────

export function SignInFlow({
  next,
  googleEnabled,
  googleError,
}: {
  next: string;
  googleEnabled: boolean;
  googleError: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [ageOk, setAgeOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    googleError
      ? "Couldn't sign in with Google. Make sure the 13 or older box is ticked, then try again."
      : null,
  );
  const [resendIn, setResendIn] = useState(0);

  // Remember the age box between steps and visits (the cookie lasts an hour)
  useEffect(() => {
    if (hasAgeCookie()) setAgeOk(true); // eslint-disable-line react-hooks/set-state-in-effect -- reads a browser-only cookie after hydration
  }, []);

  // Countdown for "send a new code"
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  function go(nextStep: Step) {
    setError(null);
    setCode("");
    setStep(nextStep);
  }

  // /welcome asks for a username if the account doesn't have one yet,
  // then continues to `next`
  const afterSignIn = `/welcome?next=${encodeURIComponent(next)}`;

  function finish() {
    router.push(afterSignIn);
    router.refresh();
  }

  function onAgeChange(checked: boolean) {
    setAgeOk(checked);
    setAgeCookie(checked);
  }

  // ── Actions ──

  async function signInWithGoogle() {
    setError(null);
    setBusy(true);
    trackEvent("sign-in-start", { method: "google" });
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: afterSignIn,
      errorCallbackURL: `/sign-in?error=google&next=${encodeURIComponent(next)}`,
    });
    if (error) {
      setBusy(false);
      setError(describeError(error));
      trackEvent("sign-in-error", { method: "google", reason: error.code ?? `http-${error.status}` });
    }
  }

  async function sendCode(type: "sign-in" | "email-verification") {
    setBusy(true);
    setError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type });
    setBusy(false);
    if (error) {
      setError(describeError(error));
      trackEvent("sign-in-error", {
        method: type === "sign-in" ? "code" : "password",
        reason: error.code ?? `http-${error.status}`,
      });
      return false;
    }
    setResendIn(CODE_RESEND_SECONDS);
    return true;
  }

  async function onStartSubmit(e: FormEvent) {
    e.preventDefault();
    trackEvent("sign-in-start", { method: "code" });
    if (await sendCode("sign-in")) go("code");
  }

  async function onCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await authClient.signIn.emailOtp({ email, otp: code });
    if (error) {
      setBusy(false);
      setError(describeError(error));
      trackEvent("sign-in-error", { method: "code", reason: error.code ?? `http-${error.status}` });
      return;
    }
    trackEvent("sign-in-complete", { method: "code", new_account: isNewAccount(data?.user.createdAt) });
    finish();
  }

  async function onPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    trackEvent("sign-in-start", { method: "password" });
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setBusy(false);
      // Password account that never confirmed its email: send a code
      if (error.code === "EMAIL_NOT_VERIFIED" || error.status === 403) {
        if (await sendCode("email-verification")) go("verify");
        return;
      }
      setError(describeError(error));
      trackEvent("sign-in-error", { method: "password", reason: error.code ?? `http-${error.status}` });
      return;
    }
    trackEvent("sign-in-complete", { method: "password", new_account: false });
    finish();
  }

  async function onCreateSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    trackEvent("sign-in-start", { method: "password" });
    // With email verification required, this sends a code and returns no session
    const { error } = await authClient.signUp.email({ email, password, name: "" });
    setBusy(false);
    if (error) {
      setError(describeError(error));
      trackEvent("sign-in-error", { method: "password", reason: error.code ?? `http-${error.status}` });
      return;
    }
    setResendIn(CODE_RESEND_SECONDS);
    go("verify");
  }

  async function onVerifySubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp: code });
    if (error) {
      setBusy(false);
      setError(describeError(error));
      trackEvent("sign-in-error", { method: "password", reason: error.code ?? `http-${error.status}` });
      return;
    }
    // Verifying signs the account in (autoSignInAfterVerification)
    trackEvent("sign-in-complete", { method: "password", new_account: true });
    finish();
  }

  async function onForgotSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.emailOtp.requestPasswordReset({ email });
    setBusy(false);
    if (error) {
      setError(describeError(error));
      return;
    }
    setResendIn(CODE_RESEND_SECONDS);
    setPassword("");
    go("reset");
  }

  async function onResetSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.emailOtp.resetPassword({ email, otp: code, password });
    if (error) {
      setBusy(false);
      setError(describeError(error));
      return;
    }
    // Reset signs every device out, so sign this one back in
    const signIn = await authClient.signIn.email({ email, password });
    if (signIn.error) {
      setBusy(false);
      setPassword("");
      go("password");
      return;
    }
    trackEvent("sign-in-complete", { method: "password", new_account: false });
    finish();
  }

  async function resend(kind: "sign-in" | "email-verification" | "reset") {
    if (resendIn > 0) return;
    if (kind !== "reset") {
      await sendCode(kind);
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await authClient.emailOtp.requestPasswordReset({ email });
    setBusy(false);
    if (error) setError(describeError(error));
    else setResendIn(CODE_RESEND_SECONDS);
  }

  // ── Render ──

  const errorBox = error && (
    <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
      {error}
    </p>
  );

  const resendLine = (kind: "sign-in" | "email-verification" | "reset") => (
    <p className="text-center text-sm text-text-secondary">
      Didn&apos;t get it? Check spam, or{" "}
      {resendIn > 0 ? (
        <span>send a new code in {resendIn}s</span>
      ) : (
        <TextButton onClick={() => resend(kind)}>send a new code</TextButton>
      )}
    </p>
  );

  const emailField = (
    <input
      type="email"
      autoComplete="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value.trim())}
      placeholder="you@example.com"
      aria-label="Email"
      className={inputClass}
    />
  );

  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-6">
      {step === "start" && (
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-heading text-2xl font-bold">Sign in</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Optional. Every game works without an account.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-white/5 p-3 text-sm">
            <input
              type="checkbox"
              checked={ageOk}
              onChange={(e) => onAgeChange(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-ember"
            />
            <span>
              I&apos;m 13 or older, and I agree to the{" "}
              <Link href="/terms" className="text-ember hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-ember hover:underline">Privacy Policy</Link>.
            </span>
          </label>

          {googleEnabled && (
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={!ageOk || busy}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-white font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-default disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
              </svg>
              Continue with Google
            </button>
          )}

          {googleEnabled && (
            <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-text-secondary">
              <span className="h-px flex-1 bg-white/10" />
              or use email
              <span className="h-px flex-1 bg-white/10" />
            </div>
          )}

          <form onSubmit={onStartSubmit} className="flex flex-col gap-3">
            {emailField}
            <PrimaryButton busy={busy} disabled={!ageOk}>
              {!busy && <Mail className="h-4 w-4" />}
              Email me a code
            </PrimaryButton>
          </form>

          {errorBox}

          <p className="text-center">
            <TextButton onClick={() => go("password")}>Use a password instead</TextButton>
          </p>
        </div>
      )}

      {step === "code" && (
        <form onSubmit={onCodeSubmit} className="flex flex-col gap-4">
          <BackButton onClick={() => go("start")} />
          <div>
            <h1 className="font-heading text-2xl font-bold">Check your email</h1>
            <p className="mt-1 text-sm text-text-secondary">
              We sent a {CODE_LENGTH}-digit code to <strong className="text-text-primary">{email}</strong>.
              It expires in 5 minutes.
            </p>
          </div>
          <CodeInput value={code} onChange={setCode} />
          <PrimaryButton busy={busy} disabled={code.length !== CODE_LENGTH}>
            Sign in
          </PrimaryButton>
          {errorBox}
          {resendLine("sign-in")}
        </form>
      )}

      {step === "password" && (
        <form onSubmit={onPasswordSubmit} className="flex flex-col gap-4">
          <BackButton onClick={() => go("start")} />
          <h1 className="font-heading text-2xl font-bold">Sign in with a password</h1>
          {emailField}
          <PasswordInput
                        autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className={inputClass}
          />
          <PrimaryButton busy={busy} disabled={!ageOk}>Sign in</PrimaryButton>
          {!ageOk && (
            <p className="text-sm text-text-secondary">
              Go back and tick the 13 or older box first.
            </p>
          )}
          {errorBox}
          <div className="flex flex-wrap justify-between gap-2">
            <TextButton onClick={() => go("forgot")}>Forgot password?</TextButton>
            <TextButton onClick={() => go("create")}>Create an account</TextButton>
          </div>
        </form>
      )}

      {step === "create" && (
        <form onSubmit={onCreateSubmit} className="flex flex-col gap-4">
          <BackButton onClick={() => go("password")} />
          <div>
            <h1 className="font-heading text-2xl font-bold">Create an account</h1>
            <p className="mt-1 text-sm text-text-secondary">
              We&apos;ll email you a code to confirm it&apos;s your address.
            </p>
          </div>
          {emailField}
          <PasswordInput
                        autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Password (at least ${MIN_PASSWORD_LENGTH} characters)`}
            aria-label="Password"
            className={inputClass}
          />
          <PrimaryButton busy={busy} disabled={!ageOk}>Create account</PrimaryButton>
          {!ageOk && (
            <p className="text-sm text-text-secondary">
              Go back and tick the 13 or older box first.
            </p>
          )}
          {errorBox}
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={onVerifySubmit} className="flex flex-col gap-4">
          <BackButton onClick={() => go("password")} />
          <div>
            <h1 className="font-heading text-2xl font-bold">Confirm your email</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Enter the {CODE_LENGTH}-digit code we sent to{" "}
              <strong className="text-text-primary">{email}</strong>.
            </p>
          </div>
          <CodeInput value={code} onChange={setCode} />
          <PrimaryButton busy={busy} disabled={code.length !== CODE_LENGTH}>
            Confirm and sign in
          </PrimaryButton>
          {errorBox}
          {resendLine("email-verification")}
        </form>
      )}

      {step === "forgot" && (
        <form onSubmit={onForgotSubmit} className="flex flex-col gap-4">
          <BackButton onClick={() => go("password")} />
          <div>
            <h1 className="font-heading text-2xl font-bold">Reset your password</h1>
            <p className="mt-1 text-sm text-text-secondary">
              We&apos;ll email you a code to set a new one.
            </p>
          </div>
          {emailField}
          <PrimaryButton busy={busy}>Email me a code</PrimaryButton>
          {errorBox}
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={onResetSubmit} className="flex flex-col gap-4">
          <BackButton onClick={() => go("forgot")} />
          <div>
            <h1 className="font-heading text-2xl font-bold">Choose a new password</h1>
            <p className="mt-1 text-sm text-text-secondary">
              If <strong className="text-text-primary">{email}</strong> has an account, we sent it a code.
            </p>
          </div>
          <CodeInput value={code} onChange={setCode} />
          <PasswordInput
                        autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`New password (at least ${MIN_PASSWORD_LENGTH} characters)`}
            aria-label="New password"
            className={inputClass}
          />
          <PrimaryButton busy={busy} disabled={code.length !== CODE_LENGTH}>
            Save and sign in
          </PrimaryButton>
          {errorBox}
          {resendLine("reset")}
        </form>
      )}
    </div>
  );
}
