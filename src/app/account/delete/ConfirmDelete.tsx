"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trackEvent } from "@/lib/analytics";

export function ConfirmDelete({ token, username }: { token: string; username: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "This link is missing its code. Open the link from the email again.",
  );

  async function confirm() {
    setBusy(true);
    setError(null);
    const { error } = await authClient.deleteUser({ token });
    if (error) {
      setBusy(false);
      setError(
        "This link has expired, was already used, or belongs to a different account. Ask for a new one from your account page.",
      );
      return;
    }
    trackEvent("account-deleted", {});
    router.push("/account/deleted");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold">Delete your account?</h1>
      <p className="text-sm text-text-secondary">
        This permanently deletes <strong className="text-text-primary">{username}</strong>{" "}
        and everything saved with it. It can&apos;t be undone.
      </p>
      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={confirm}
        disabled={busy || !token}
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 font-semibold text-white transition-colors hover:bg-red-500/90 disabled:cursor-default disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete my account permanently
      </button>
      <Link
        href="/account"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-white/5 text-sm font-medium text-text-secondary hover:bg-white/10"
      >
        Keep my account
      </Link>
    </div>
  );
}
