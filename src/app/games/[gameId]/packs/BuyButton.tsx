"use client";

// ============================================================
// ArcadeKit — Buy Pack Button
// Asks the site for a Stripe checkout and sends the player there.
// The price shown is only a label: the server works out the real
// one from what the account already owns.
// ============================================================

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface BuyButtonProps {
  /** Pack id, or "bundle" */
  item: string;
  label: string;
}

export function BuyButton({ item, label }: BuyButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    trackEvent("pack-checkout-start", { item });
    try {
      const res = await fetch("/api/packs/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!data.url) throw new Error(data.error ?? "Couldn't start checkout.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-amber px-6 text-base font-semibold text-black transition-colors hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        {label}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
