"use client";

import { useRouter } from "next/navigation";
import { UsernameForm } from "@/components/account/UsernameForm";
import { trackEvent } from "@/lib/analytics";
import type { SignInMethod } from "@/lib/accounts";

export function WelcomeForm({ next, method }: { next: string; method: SignInMethod | "unknown" }) {
  const router = useRouter();
  return (
    <UsernameForm
      submitLabel="Save and continue"
      onSaved={() => {
        trackEvent("account-created", { method });
        router.push(next);
        router.refresh();
      }}
    />
  );
}
