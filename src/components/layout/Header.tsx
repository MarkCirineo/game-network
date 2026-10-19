"use client";

import Link from "next/link";
import { Gamepad2, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

/** "Sign in", or the signed-in player's username (links to /account) */
function useAccountLink(): { href: string; label: string; signedIn: boolean } | null {
  const { data, isPending } = authClient.useSession();
  if (isPending) return null;
  if (!data) return { href: "/sign-in", label: "Sign in", signedIn: false };
  const name = data.user.displayUsername || data.user.username;
  return name
    ? { href: "/account", label: name, signedIn: true }
    : { href: "/welcome?next=/account", label: "Pick a username", signedIn: true };
}

/** Far-right account control: "Sign in", or a circle with the username's initial */
function AccountButton({ account }: { account: ReturnType<typeof useAccountLink> }) {
  // Keep the space while the session loads so the header doesn't jump
  if (!account) return <span className="h-8 w-8" aria-hidden />;
  if (!account.signedIn) {
    return (
      <Link
        href={account.href}
        className="text-sm font-medium text-foreground transition-colors hover:text-ember"
      >
        {account.label}
      </Link>
    );
  }
  const hasName = account.href === "/account";
  return (
    <Link
      href={account.href}
      title={account.label}
      aria-label={hasName ? `Your account (${account.label})` : account.label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/15 text-sm font-semibold uppercase text-ember transition-colors hover:bg-ember/25"
    >
      {hasName ? account.label[0] : <UserRound className="h-4 w-4" />}
    </Link>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const account = useAccountLink();

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
            href="/tools"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
          >
            Tools
          </Link>
          <Link
            href="/games"
            className="inline-flex h-9 items-center rounded-lg bg-ember px-4 text-sm font-medium text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
          >
            Play Now
          </Link>
          <AccountButton account={account} />
        </nav>

        {/* Mobile: account + menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <AccountButton account={account} />
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
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/5 transition-all duration-200 md:hidden",
          mobileMenuOpen ? "max-h-64" : "max-h-0"
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
            href="/tools"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-foreground"
          >
            Tools
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
