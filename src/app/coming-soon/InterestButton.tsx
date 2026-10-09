"use client";

// ============================================================
// ArcadeKit — "I'd use this" Button
// Records interest in a planned feature as an anonymous Umami
// event. Nothing is stored; the "noted" state is local only.
// ============================================================

import { useState } from "react";
import { Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface InterestButtonProps {
  /** Feature the visitor is interested in */
  feature: string;
  /** Feature (or "none"/"unknown") the visitor arrived for */
  from: string;
}

export function InterestButton({ feature, from }: InterestButtonProps) {
  const [noted, setNoted] = useState(false);

  function handleClick() {
    if (noted) return;
    trackEvent("coming-soon-interest", { feature, from });
    setNoted(true);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={noted}
      className={
        noted
          ? "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-cyan/10 px-3 text-sm font-medium text-cyan"
          : "inline-flex h-10 shrink-0 items-center rounded-lg border border-white/10 px-3 text-sm font-medium text-text-primary transition-colors hover:border-white/20 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/50"
      }
    >
      {noted ? (
        <>
          <Check className="h-4 w-4" />
          Noted
        </>
      ) : (
        "I'd use this"
      )}
    </button>
  );
}
