"use client";

// ============================================================
// ArcadeKit — Account panel
// Username, email, sign-in methods (code / Google / password),
// sign out, and delete account (confirmed by an emailed link).
// ============================================================

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, KeyRound, Loader2, LogOut, Mail, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/account/PasswordInput";
import { trackEvent } from "@/lib/analytics";
import { MIN_PASSWORD_LENGTH } from "@/lib/accounts";
import { USERNAME_CHANGE_DAYS } from "@/lib/usernames";
import { UsernameForm } from "@/components/account/UsernameForm";
import { addPassword } from "./actions";

interface AccountPanelProps {
  username: string;
  email: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  googleEnabled: boolean;
}

const inputClass =
  "h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-base text-foreground placeholder:text-text-muted focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-surface p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</h2>
      {children}
    </section>
  );
}

function SmallButton({
  onClick,
  children,
  tone = "default",
  disabled,
}: {
  onClick?: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled}
      className={
        tone === "danger"
          ? "inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-red-500/15 px-4 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:cursor-default disabled:opacity-50"
          : "inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white/5 disabled:cursor-default disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}

// ── Password ────────────────────────────────────────────────

function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saved, setSaved] = useState(hasPassword);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (saved) {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      setBusy(false);
      if (error) {
        setMessage({
          ok: false,
          text: error.code === "INVALID_PASSWORD" ? "Your current password isn't right." : error.message || "Couldn't change the password.",
        });
        return;
      }
      setMessage({ ok: true, text: "Password changed. Other devices were signed out." });
    } else {
      const result = await addPassword(next);
      setBusy(false);
      if (result.error) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setSaved(true);
      setMessage({ ok: true, text: "Password added. You can now sign in with it too." });
    }
    setOpen(false);
    setCurrent("");
    setNext("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm">
          <KeyRound className="h-4 w-4 text-text-secondary" />
          Password {saved ? <span className="text-text-secondary">· set</span> : <span className="text-text-secondary">· not set</span>}
        </span>
        {!open && <SmallButton onClick={() => setOpen(true)}>{saved ? "Change" : "Add a password"}</SmallButton>}
      </div>
      {open && (
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          {saved && (
            <PasswordInput
                            autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current password"
              aria-label="Current password"
              className={inputClass}
            />
          )}
          <PasswordInput
                        autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder={`New password (at least ${MIN_PASSWORD_LENGTH} characters)`}
            aria-label="New password"
            className={inputClass}
          />
          <div className="flex gap-2">
            <SmallButton disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save password
            </SmallButton>
            <SmallButton onClick={() => setOpen(false)}>Cancel</SmallButton>
          </div>
        </form>
      )}
      {message && (
        <p className={`text-sm ${message.ok ? "text-cyan" : "text-red-300"}`} role="status">
          {message.text}
        </p>
      )}
    </div>
  );
}

// ── Panel ───────────────────────────────────────────────────

export function AccountPanel({ username, email, hasPassword, hasGoogle, googleEnabled }: AccountPanelProps) {
  const router = useRouter();
  const [name, setName] = useState(username);
  const [editingName, setEditingName] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "sent">("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    trackEvent("sign-out", {});
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  async function connectGoogle() {
    setError(null);
    const { error } = await authClient.linkSocial({ provider: "google", callbackURL: "/account" });
    if (error) setError(error.message || "Couldn't connect Google. Please try again.");
  }

  async function requestDelete() {
    setBusy(true);
    setError(null);
    const { error } = await authClient.deleteUser({ callbackURL: "/account/deleted" });
    setBusy(false);
    if (error) {
      setError(error.message || "Couldn't send the email. Please try again.");
      return;
    }
    trackEvent("account-delete-request", {});
    setDeleteStep("sent");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Your account</h1>

      <Section title="Username">
        {editingName ? (
          <div className="flex flex-col gap-2">
            <UsernameForm
              current={name}
              submitLabel="Save username"
              onSaved={(saved) => {
                setName(saved);
                setEditingName(false);
                router.refresh();
              }}
            />
            <p className="text-xs text-text-secondary">
              You can change your username once every {USERNAME_CHANGE_DAYS} days.
            </p>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              className="cursor-pointer self-start text-sm text-text-secondary hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-lg font-bold">{name}</span>
            <SmallButton onClick={() => setEditingName(true)}>Change</SmallButton>
          </div>
        )}
      </Section>

      <Section title="Email">
        <p className="truncate text-sm">{email}</p>
        <p className="mt-1 text-xs text-text-secondary">Only used to sign in. Never shown to other players.</p>
      </Section>

      <Section title="Ways to sign in">
        <div className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-text-secondary" />
            Email code <span className="text-text-secondary">· always available</span>
          </span>

          {(hasGoogle || googleEnabled) && (
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.6 3.9-5.35 3.9a6 6 0 1 1 0-12c1.5 0 2.85.55 3.9 1.45l2.15-2.15A9 9 0 1 0 21 12c0-.3 0-.6-.05-.9z" />
                </svg>
                Google
                {hasGoogle && (
                  <span className="inline-flex items-center gap-1 text-text-secondary">
                    · <Check className="h-3.5 w-3.5 text-cyan" /> connected
                  </span>
                )}
              </span>
              {!hasGoogle && <SmallButton onClick={connectGoogle}>Connect</SmallButton>}
            </div>
          )}

          <PasswordSection hasPassword={hasPassword} />
        </div>
      </Section>

      <Section title="Session">
        <SmallButton onClick={signOut} disabled={busy}>
          <LogOut className="h-4 w-4" />
          Sign out
        </SmallButton>
      </Section>

      <Section title="Delete account">
        {deleteStep === "idle" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary">
              Permanently delete your account and everything saved with it. Games stay free to play
              without an account.
            </p>
            <SmallButton tone="danger" onClick={() => setDeleteStep("confirm")}>
              <Trash2 className="h-4 w-4" />
              Delete my account
            </SmallButton>
          </div>
        )}
        {deleteStep === "confirm" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              We&apos;ll email <strong>{email}</strong> a link. Your account is deleted only when you
              open it. This can&apos;t be undone.
            </p>
            <div className="flex flex-wrap gap-2">
              <SmallButton tone="danger" onClick={requestDelete} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Email me the link
              </SmallButton>
              <SmallButton onClick={() => setDeleteStep("idle")}>Cancel</SmallButton>
            </div>
          </div>
        )}
        {deleteStep === "sent" && (
          <p className="text-sm text-cyan" role="status">
            Check your email for the link. Nothing is deleted until you open it.
          </p>
        )}
      </Section>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
