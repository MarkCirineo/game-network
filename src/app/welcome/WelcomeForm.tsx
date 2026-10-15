"use client";

import { useRouter } from "next/navigation";
import { UsernameForm } from "@/components/account/UsernameForm";

export function WelcomeForm({ next }: { next: string }) {
  const router = useRouter();
  return (
    <UsernameForm
      submitLabel="Save and continue"
      onSaved={() => {
        router.push(next);
        router.refresh();
      }}
    />
  );
}
