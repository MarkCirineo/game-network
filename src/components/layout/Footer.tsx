// ============================================================
// ArcadeKit — Footer Component
// Simple footer with copyright, attribution, and games link.
// ============================================================

"use client";

import Link from "next/link";
import { Coffee, Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-midnight">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between">
        {/* Brand / Copyright */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Gamepad2 className="h-3.5 w-3.5 text-ember" />
          <span>&copy; {new Date().getFullYear()} ArcadeKit</span>
        </div>

        {/* Right side links */}
        <div className="flex items-center gap-3">
          <a
            href="https://buymeacoffee.com/arcadekit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-amber-400 transition-colors hover:text-amber-300"
          >
            <Coffee className="h-3 w-3" />
            Buy me a coffee
          </a>
          <span className="text-white/10">·</span>
          <Link
            href="/games"
            className="text-xs text-text-secondary transition-colors hover:text-ember"
          >
            Browse Games
          </Link>
        </div>
      </div>
    </footer>
  );
}
