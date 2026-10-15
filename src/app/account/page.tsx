// ============================================================
// ArcadeKit — Account (/account)
// Username, email, sign-in methods, sign out, delete account.
// ============================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountPanel } from "./AccountPanel";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/sign-in?next=/account");
  if (!session.user.username) redirect("/welcome?next=/account");

  const accounts = await auth.api.listUserAccounts({ headers: requestHeaders });
  const providers = new Set(accounts.map((a) => a.providerId));

  return (
    <div className="px-4 py-8 md:py-14">
      <div className="mx-auto max-w-lg">
        <AccountPanel
          username={session.user.displayUsername || session.user.username}
          email={session.user.email}
          hasPassword={providers.has("credential")}
          hasGoogle={providers.has("google")}
          googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
        />
      </div>
    </div>
  );
}
