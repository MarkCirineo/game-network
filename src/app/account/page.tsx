// ============================================================
// ArcadeKit — Account (/account)
// Username, board packs, email, sign-in methods, sign out, delete account.
// ============================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { describeAuthError } from "@/lib/authErrors";
import { packsFor } from "@/lib/packs";
import { AccountPanel } from "./AccountPanel";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AccountPage({ searchParams }: Props) {
  const rawError = (await searchParams).error;
  const linkError = rawError ? describeAuthError(Array.isArray(rawError) ? rawError[0] : rawError) : null;
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/sign-in?next=/account");
  if (!session.user.username) redirect("/welcome?next=/account");

  const accounts = await auth.api.listUserAccounts({ headers: requestHeaders });
  const providers = new Set(accounts.map((a) => a.providerId));

  // Packs beyond the free ones: free-with-account packs, then bought ones
  const allPacks = await packsFor(session.user.id);
  const packs = allPacks
    .filter((p) => p.access !== "free" && p.status === "unlocked")
    .map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, bought: p.owned }));
  const packsToBuy = allPacks.filter((p) => p.status === "buy").length;

  return (
    <div className="px-4 py-8 md:py-14">
      <div className="mx-auto max-w-lg">
        <AccountPanel
          username={session.user.displayUsername || session.user.username}
          email={session.user.email}
          hasPassword={providers.has("credential")}
          hasGoogle={providers.has("google")}
          googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
          linkError={linkError}
          packs={packs}
          packsToBuy={packsToBuy}
        />
      </div>
    </div>
  );
}
