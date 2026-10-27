// ============================================================
// ArcadeKit — Signed in (/signed-in)
// Where a sign-in started from a game lobby ends. The lobby stays in
// the other tab (it hears about the sign-in), so this one just says
// so and closes itself if the browser allows it.
// ============================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SIGNED_IN_PATH } from "@/lib/signInTab";
import { SignedInTab } from "./SignedInTab";

export const metadata: Metadata = {
  title: "Signed In",
  robots: { index: false, follow: false },
};

export default async function SignedInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(SIGNED_IN_PATH)}`);
  if (!session.user.username) redirect(`/welcome?next=${encodeURIComponent(SIGNED_IN_PATH)}`);

  return (
    <div className="px-4 py-12 md:py-20">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/5 bg-surface p-6 text-center">
        <h1 className="font-heading text-2xl font-bold">You&apos;re signed in</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Signed in as{" "}
          <span className="font-semibold text-foreground">
            {session.user.displayUsername || session.user.username}
          </span>
          . Go back to your game&apos;s tab: you&apos;re still the host, and the packs you
          unlocked are ready to pick.
        </p>
        <SignedInTab />
      </div>
    </div>
  );
}
