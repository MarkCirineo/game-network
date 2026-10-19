// ============================================================
// ArcadeKit — Pick a username (/welcome)
// Required once, right after an account's first sign-in. Accounts
// without a username are sent here before anything else.
// ============================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isNewAccount, parseSignInMethod, safeNextPath } from "@/lib/accounts";
import { GoogleSignInDone } from "./GoogleSignInDone";
import { WelcomeForm } from "./WelcomeForm";

export const metadata: Metadata = {
  title: "Pick a Username",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WelcomePage({ searchParams }: Props) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const next = safeNextPath(first(params.next));
  const via = parseSignInMethod(first(params.via));

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);

  // Google comes back here from its own site, so this is the only place
  // its sign-in can be counted (code and password count it themselves)
  const googleDone = via === "google" && (
    <GoogleSignInDone
      signInKey={new Date(session.session.createdAt).getTime().toString()}
      newAccount={isNewAccount(session.user.createdAt)}
      continueTo={session.user.username ? next : null}
    />
  );
  if (session.user.username) {
    if (googleDone) {
      return (
        <p className="px-4 py-14 text-center text-sm text-text-secondary">
          Signing you in…
          {googleDone}
        </p>
      );
    }
    redirect(next);
  }

  return (
    <div className="px-4 py-8 md:py-14">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/5 bg-surface p-6">
        <h1 className="font-heading text-2xl font-bold">Pick a username</h1>
        <p className="mt-1 mb-5 text-sm text-text-secondary">
          This is the only name other players will see, so don&apos;t use your real name.
          You can change it later.
        </p>
        <WelcomeForm next={next} method={via ?? "unknown"} />
      </div>
      {googleDone}
    </div>
  );
}
