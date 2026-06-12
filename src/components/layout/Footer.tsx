// ============================================================
// ArcadeKit — Footer Component
// Simple footer with copyright, attribution, and games link.
// ============================================================

"use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-midnight">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 sm:flex-row sm:justify-between">
        {/* Brand / Copyright */}
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Gamepad2 className="h-4 w-4 text-violet" />
          <span>&copy; 2024–2025 ArcadeKit. All rights reserved.</span>
        </div>

        {/* Center — Built with */}
        <p className="text-xs text-text-muted">
          Built with <span className="text-pink">❤️</span> for players everywhere
        </p>

        {/* Games link */}
        <Link
          href="/games"
          className="text-sm font-medium text-text-secondary transition-colors hover:text-violet"
        >
          Browse Games
        </Link>
      </div>
    </footer>
  );
}
