// ============================================================
// ArcadeKit — AdSense Ad Slot
// Renders a Google AdSense ad unit, or a dev placeholder when
// the ADSENSE_ID env var is not configured.
// ============================================================

"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical";

interface AdSlotProps {
  /** AdSense ad unit slot ID (e.g. "1234567890") */
  slot: string;
  /** Ad layout format — controls sizing and AdSense data-ad-format */
  format?: AdFormat;
  /** Whether the ad is responsive (default: true) */
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

const FORMAT_MIN_HEIGHTS: Record<AdFormat, string> = {
  rectangle: "min-h-[250px]",
  horizontal: "min-h-[90px]",
  vertical: "min-h-[600px]",
  auto: "min-h-[100px]",
};

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

export function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  className,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Only push once per mount, and only when AdSense is configured
    if (!adsenseId || pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script may not have loaded yet — fail silently
    }
  }, []);

  const minHeight = FORMAT_MIN_HEIGHTS[format];

  // --- No AdSense ID configured ---
  if (!adsenseId) {
    // In production, render nothing
    if (process.env.NODE_ENV !== "development") return null;

    // In development, show a visible placeholder
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/10 bg-white/5",
          minHeight,
          className
        )}
      >
        <span className="text-xs font-medium text-text-muted">
          Ad Slot: {slot}
        </span>
        <span className="text-[10px] text-text-muted/60">{format}</span>
      </div>
    );
  }

  // --- AdSense is configured ---
  return (
    <ins
      ref={adRef}
      className={cn("adsbygoogle block", minHeight, className)}
      style={{ display: "block" }}
      data-ad-client={adsenseId}
      data-ad-slot={slot}
      data-ad-format={format}
      {...(responsive && { "data-full-width-responsive": "true" })}
    />
  );
}
