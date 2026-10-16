// ============================================================
// ArcadeKit — Sign In (/sign-in)
// One page for every way in: Google, email code, or password.
// Signing in with a code creates the account on first use, so
// there's no separate sign-up page.
// ============================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeNextPath } from "@/lib/accounts";
import { describeAuthError } from "@/lib/authErrors";
import { SignInFlow } from "./SignInFlow";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to ArcadeKit. Accounts are optional: every game works without one.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNextPath(first(params.next));

  const session = await auth.api.getSession({ headers: await headers() });
  // Already signed in: /welcome asks for a username if needed, then goes on
  if (session) redirect(`/welcome?next=${encodeURIComponent(next)}`);

  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="px-4 py-8 md:py-14">
      <div className="mx-auto max-w-sm">
        <SignInFlow
          next={next}
          googleEnabled={googleEnabled}
          googleError={params.error ? describeAuthError(first(params.error)) : null}
        />
      </div>
    </div>
  );
}
