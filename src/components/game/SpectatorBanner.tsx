// ============================================================
// ArcadeKit — Spectator Banner
// Non-intrusive banner shown when the user is spectating a game.
// ============================================================

"use client";

import { cn } from "@/lib/utils";

interface SpectatorBannerProps {
  spectatorCount: number;
  className?: string;
}

export function SpectatorBanner({ spectatorCount, className }: SpectatorBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 border-b border-white/5 bg-surface/80 px-4 py-1.5 text-xs text-text-secondary backdrop-blur-sm",
        className
      )}
    >
      <span className="text-sm">👁</span>
      <span>You are spectating</span>
      <span className="text-text-muted">•</span>
      <span className="tabular-nums">
        {spectatorCount} watching
      </span>
    </div>
  );
}
