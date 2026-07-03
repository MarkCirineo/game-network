// ============================================================
// ArcadeKit — Footer Component
// Footer with copyright, legal links, and navigation.
// ============================================================

"use client";

import Link from "next/link";
import { Coffee, Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-midnight">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Main footer row */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand / Copyright */}
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Gamepad2 className="h-3.5 w-3.5 text-ember" />
            <span>&copy; {new Date().getFullYear()} ArcadeKit</span>
          </div>

          {/* Navigation links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/games"
              className="text-text-secondary transition-colors hover:text-ember"
            >
              Games
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="/tools"
              className="text-text-secondary transition-colors hover:text-ember"
            >
              Tools
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="/about"
              className="text-text-secondary transition-colors hover:text-ember"
            >
              About
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="/contact"
              className="text-text-secondary transition-colors hover:text-ember"
            >
              Contact
            </Link>
            <span className="text-white/10">·</span>
            <a
              href="https://buymeacoffee.com/arcadekit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 transition-colors hover:text-amber-300"
            >
              <Coffee className="h-3 w-3" />
              Buy me a coffee
            </a>
          </div>
        </div>

        {/* Legal links row */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-text-muted sm:justify-end">
          <Link
            href="/privacy"
            className="transition-colors hover:text-text-secondary"
          >
            Privacy Policy
          </Link>
          <span className="text-white/10">·</span>
          <Link
            href="/terms"
            className="transition-colors hover:text-text-secondary"
          >
            Terms of Service
          </Link>
        </div>

        {/* Affiliate disclosure */}
        <p className="mt-3 text-center text-[10px] leading-relaxed text-text-muted/60 sm:text-right">
          Some links on this site may be affiliate links. We may earn a small
          commission at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}
