"use client";

// ============================================================
// ArcadeKit — Tool Use Tracker
// Wraps a tool and records a Umami event the first time the
// visitor actually interacts with it (a page view alone doesn't
// mean the tool got used).
// ============================================================

import { useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/** Keys that move focus around the page rather than use the tool */
const NAVIGATION_KEYS = new Set(["Tab", "Shift", "Escape"]);

export function TrackToolUse({
  tool,
  children,
}: {
  tool: string;
  children: React.ReactNode;
}) {
  const sent = useRef(false);

  const markUsed = () => {
    if (sent.current) return;
    sent.current = true;
    trackEvent("tool-use", { tool });
  };

  return (
    // display: contents keeps the wrapper out of the tool's layout;
    // events still bubble through it
    <div
      className="contents"
      onPointerDownCapture={markUsed}
      onKeyDownCapture={(e) => {
        if (!NAVIGATION_KEYS.has(e.key)) markUsed();
      }}
    >
      {children}
    </div>
  );
}
