"use client";

// ============================================================
// ArcadeKit — Count a finished Google sign-in
// Fires sign-in-complete once per sign-in (a refresh doesn't count
// it again), then continues to where the player was going when they
// already have a username.
// ============================================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function GoogleSignInDone({
  signInKey,
  newAccount,
  continueTo,
}: {
  /** Identifies this sign-in (the session's start time) */
  signInKey: string;
  newAccount: boolean;
  /** Where to go next, or null to stay on this page */
  continueTo: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    const key = `ak_signin_counted_${signInKey}`;
    let counted = false;
    try {
      counted = sessionStorage.getItem(key) === "1";
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: count it anyway
    }
    if (!counted) trackEvent("sign-in-complete", { method: "google", new_account: newAccount });
    if (continueTo) router.replace(continueTo);
  }, [signInKey, newAccount, continueTo, router]);

  return null;
}
