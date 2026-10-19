"use client";

// ============================================================
// ArcadeKit — Username form
// Used for the required first pick (/welcome) and for changing it
// later (/account). Starts with a random suggestion so picking is
// one tap.
// ============================================================

import { useState, type FormEvent } from "react";
import { Loader2, Shuffle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  USERNAME_MAX_LENGTH,
  suggestUsername,
  usernameError,
  usernameFormatError,
} from "@/lib/usernames";

interface UsernameFormProps {
  /** Current username (display form), if changing */
  current?: string | null;
  submitLabel: string;
  onSaved: (username: string) => void;
}

export function UsernameForm({ current, submitLabel, onSaved }: UsernameFormProps) {
  const [value, setValue] = useState(() => current ?? suggestUsername());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show format problems as they type, content problems only on submit
  const formatError = value.length > 0 ? usernameFormatError(value) : null;
  const unchanged = current != null && value === current;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = usernameError(value);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError(null);

    const available = await authClient.isUsernameAvailable({ username: value });
    // A different capitalization of your own name is fine
    const isOwn = current != null && current.toLowerCase() === value.toLowerCase();
    if (!isOwn && available.data && !available.data.available) {
      setBusy(false);
      setError("That username is taken. Try another.");
      return;
    }

    const { error } = await authClient.updateUser({ username: value, displayUsername: value });
    setBusy(false);
    if (error) {
      setError(
        error.code === "USERNAME_IS_ALREADY_TAKEN"
          ? "That username is taken. Try another."
          : error.code === "USERNAME_IS_INVALID" || error.code === "INVALID_USERNAME"
            ? "That username isn't allowed. Try another."
            : error.message || "Couldn't save the username. Please try again.",
      );
      return;
    }
    onSaved(value);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\s/g, "").slice(0, USERNAME_MAX_LENGTH));
            setError(null);
          }}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Username"
          aria-invalid={Boolean(formatError || error)}
          className="h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 font-medium text-foreground focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember"
        />
        <button
          type="button"
          onClick={() => {
            setValue(suggestUsername());
            setError(null);
          }}
          aria-label="Suggest another username"
          title="Suggest another"
          className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-text-secondary transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <Shuffle className="h-4 w-4" />
        </button>
      </div>

      <p className={`text-xs ${formatError || error ? "text-red-300" : "text-text-secondary"}`} role={error ? "alert" : undefined}>
        {error ?? formatError ?? "3–20 letters, numbers, or underscores. Other players will see this name."}
      </p>

      <button
        type="submit"
        disabled={busy || Boolean(formatError) || unchanged}
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-ember font-semibold text-white transition-colors hover:bg-ember/90 disabled:cursor-default disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
