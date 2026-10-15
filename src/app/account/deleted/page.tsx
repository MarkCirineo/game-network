// ============================================================
// ArcadeKit — Account deleted (/account/deleted)
// Where the delete-account email link lands after deleting.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Deleted",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <div className="px-4 py-12 md:py-20">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/5 bg-surface p-6 text-center">
        <h1 className="font-heading text-2xl font-bold">Your account is deleted</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your account and everything saved with it have been removed. You can keep playing
          every game without an account.
        </p>
        <Link
          href="/games"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-ember px-6 text-sm font-semibold text-white hover:bg-ember/90"
        >
          Play a game
        </Link>
      </div>
    </div>
  );
}
