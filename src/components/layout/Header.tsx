"use client";

import Link from "next/link";
import { Gamepad2, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-midnight/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight text-foreground transition-colors hover:text-ember"
        >
          <Gamepad2 className="h-5 w-5 text-ember" />
          <span>ArcadeKit</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/games"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
          >
            Games
          </Link>
          <Link
            href="/games"
            className="inline-flex h-9 items-center rounded-lg bg-ember px-4 text-sm font-medium text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
          >
            Play Now
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/5 transition-all duration-200 md:hidden",
          mobileMenuOpen ? "max-h-48" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          <Link
            href="/games"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-foreground"
          >
            Games
          </Link>
          <Link
            href="/games"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-1 inline-flex h-9 items-center justify-center rounded-lg bg-ember px-4 text-sm font-medium text-white transition-all hover:bg-ember/90"
          >
            Play Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
