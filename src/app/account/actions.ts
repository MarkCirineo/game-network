"use server";

// ============================================================
// ArcadeKit — Account server actions
// Better Auth's setPassword is server-only, so "Add a password"
// for code and Google accounts goes through here.
// ============================================================

import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/accounts";

export async function addPassword(newPassword: string): Promise<{ error?: string }> {
  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > 128) {
    return { error: `Passwords need ${MIN_PASSWORD_LENGTH} to 128 characters.` };
  }

  try {
    await auth.api.setPassword({ body: { newPassword }, headers: await headers() });
    return {};
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "SESSION_EXPIRED") {
        return { error: "For safety, sign out and back in before adding a password." };
      }
      if (error.body?.code === "PASSWORD_ALREADY_SET") {
        return { error: "This account already has a password. Use Change password instead." };
      }
      return { error: error.body?.message ?? "Couldn't add the password. Please try again." };
    }
    console.error("[ArcadeKit] addPassword failed:", error);
    return { error: "Couldn't add the password. Please try again." };
  }
}
