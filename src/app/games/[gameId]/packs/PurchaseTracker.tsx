"use client";

// ============================================================
// ArcadeKit — Pack Purchase Tracker
// Sends pack-purchase once per checkout when the buyer lands back on
// the packs page (a reload of the same URL doesn't count it again).
// ============================================================

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function PurchaseTracker({ checkoutId, packIds }: { checkoutId: string; packIds: string[] }) {
  useEffect(() => {
    const key = `arcadekit-purchase:${checkoutId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: count it anyway
    }
    trackEvent("pack-purchase", { packs: packIds.join(","), count: packIds.length });
  }, [checkoutId, packIds]);

  return null;
}
