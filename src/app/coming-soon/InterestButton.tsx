"use client";

// ============================================================
// ArcadeKit — "I'd use this" Button
// Records interest in a planned feature as an anonymous Umami
// event. Counts once per feature per browser: a localStorage flag
// keeps the button in its "noted" state across reloads, so one
// visitor can't inflate the numbers by clicking repeatedly.
// ============================================================

import { useState, useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const STORAGE_PREFIX = "arcadekit-interest:";
const CHANGE_EVENT = "arcadekit-interest-change";

function readNoted(feature: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + feature) === "1";
  } catch {
    return false; // storage blocked (private mode, etc.)
  }
}

function writeNoted(feature: string): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + feature, "1");
  } catch {
    // storage blocked — the in-memory state still disables the button
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

interface InterestButtonProps {
  /** Feature the visitor is interested in */
  feature: string;
  /** Feature (or "none"/"unknown") the visitor arrived for */
  from: string;
  /** Where the button sits: the main feature card or the feature list */
  placement: "main" | "list";
}

export function InterestButton({ feature, from, placement }: InterestButtonProps) {
  const stored = useSyncExternalStore(
    subscribe,
    () => readNoted(feature),
    () => false // server render: never noted
  );
  const [clicked, setClicked] = useState(false);
  const noted = stored || clicked;

  function handleClick() {
    if (noted) return;
    trackEvent("coming-soon-interest", { feature, from, placement });
    setClicked(true);
    writeNoted(feature);
  }

  const size =
    placement === "main" ? "h-11 w-full px-4 sm:w-auto" : "h-10 shrink-0 px-3";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={noted}
      aria-pressed={noted}
      className={
        noted
          ? `inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan/10 text-sm font-medium text-cyan ${size}`
          : placement === "main"
            ? `inline-flex cursor-pointer items-center justify-center rounded-lg bg-ember text-sm font-semibold text-white transition-colors hover:bg-ember/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 ${size}`
            : `inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/10 text-sm font-medium text-text-primary transition-colors hover:border-white/20 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 ${size}`
      }
    >
      {noted ? (
        <>
          <Check className="h-4 w-4" />
          {placement === "main" ? "Thanks, noted" : "Noted"}
        </>
      ) : (
        "I'd use this"
      )}
    </button>
  );
}
