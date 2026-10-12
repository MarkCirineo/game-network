"use client";

// ============================================================
// ArcadeKit — Coming-Soon View Tracker
// Records which feature a visitor arrived for as a Umami event.
// ============================================================

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

export function ComingSoonTracker({ feature }: { feature: string }) {
  // Strict Mode runs effects twice in dev; only report each feature once
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (lastSent.current === feature) return;
    lastSent.current = feature;
    trackEvent(`coming-soon-view-${feature}`, { feature });
  }, [feature]);

  return null;
}
