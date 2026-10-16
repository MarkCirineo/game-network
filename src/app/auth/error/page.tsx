// ============================================================
// ArcadeKit — Auth error (/auth/error)
// Fallback for Better Auth errors that don't have their own page
// (onAPIError.errorURL), e.g. an old or already-used email link.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { describeAuthError } from "@/lib/authErrors";

export const metadata: Metadata = {
  title: "Something Went Wrong",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const raw = (await searchParams).error;
  const code = Array.isArray(raw) ? raw[0] : raw;

  return (
    <div className="px-4 py-12 md:py-20">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/5 bg-surface p-6 text-center">
        <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-text-secondary">{describeAuthError(code)}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/account"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-ember px-6 text-sm font-semibold text-white hover:bg-ember/90"
          >
            Go to your account
          </Link>
          <Link
            href="/games"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-white/5 px-6 text-sm font-medium text-text-secondary hover:bg-white/10"
          >
            Play a game
          </Link>
        </div>
      </div>
    </div>
  );
}
