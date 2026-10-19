// ============================================================
// ArcadeKit — Confirm account deletion (/account/delete?token=…)
// Where the delete-account email links. Deleting needs you to be
// signed in, so signed-out visitors (e.g. opening the email on
// another device) sign in first and come straight back here.
// ============================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ConfirmDelete } from "./ConfirmDelete";

export const metadata: Metadata = {
  title: "Delete Your Account",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ConfirmDeletePage({ searchParams }: Props) {
  const raw = (await searchParams).token;
  const token = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const back = `/account/delete?token=${encodeURIComponent(token)}`;
    redirect(`/sign-in?next=${encodeURIComponent(back)}`);
  }

  return (
    <div className="px-4 py-12 md:py-20">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/5 bg-surface p-6">
        <ConfirmDelete
          token={token}
          username={session.user.displayUsername || session.user.username || session.user.email}
        />
      </div>
    </div>
  );
}
