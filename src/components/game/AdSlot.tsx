// ============================================================
// ArcadeKit — Ad Slot Placeholder
// Development-only placeholder. Replace with AdSense in production.
// ============================================================

"use client";

import { cn } from "@/lib/utils";

interface AdSlotProps {
  position: "top" | "bottom" | "sidebar";
  className?: string;
}

export function AdSlot({ position, className }: AdSlotProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed border-white/10",
        position === "sidebar" ? "h-48 w-full" : "h-16 w-full",
        className
      )}
    >
      <span className="text-xs text-text-muted select-none">Ad</span>
    </div>
  );
}
