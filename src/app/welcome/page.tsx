// ============================================================
// ArcadeKit — Pick a username (/welcome)
// Required once, right after an account's first sign-in. Accounts
// without a username are sent here before anything else.
// ============================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeNextPath } from "@/lib/accounts";
import { WelcomeForm } from "./WelcomeForm";

export const metadata: Metadata = {
  title: "Pick a Username",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WelcomePage({ searchParams }: Props) {
  const rawNext = (await searchParams).next;
  const next = safeNextPath(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (session.user.username) redirect(next);

  return (
    <div className="px-4 py-8 md:py-14">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/5 bg-surface p-6">
        <h1 className="font-heading text-2xl font-bold">Pick a username</h1>
        <p className="mt-1 mb-5 text-sm text-text-secondary">
          This is the only name other players will see, so don&apos;t use your real name.
          You can change it later.
        </p>
        <WelcomeForm next={next} />
      </div>
    </div>
  );
}
