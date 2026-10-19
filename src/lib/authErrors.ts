// ============================================================
// ArcadeKit — Friendly text for Better Auth redirect errors
// Google sign-in and linking, and email links (delete account),
// come back with ?error=<code>. Map the codes players can hit to
// plain messages instead of Better Auth's built-in error page.
// ============================================================

const MESSAGES: Record<string, string> = {
  email_does_not_match:
    "That Google account uses a different email. Connect the Google account that uses the same email as your ArcadeKit account.",
  account_already_linked:
    "That Google account is already connected to a different ArcadeKit account.",
  account_already_linked_to_different_user:
    "That Google account is already connected to a different ArcadeKit account.",
  unable_to_create_user:
    "Couldn't create your account. Make sure the 13 or older box is ticked, then try again.",
  access_denied: "Google sign-in was cancelled.",
  state_mismatch: "That sign-in took too long or was opened in another tab. Please try again.",
  state_not_found: "That sign-in took too long or was opened in another tab. Please try again.",
  please_restart_the_process: "That sign-in took too long or was opened in another tab. Please try again.",
  invalid_token: "That link has expired or was already used.",
  token_expired: "That link has expired or was already used.",
};

export function describeAuthError(code: string | null | undefined): string {
  if (!code) return "Something went wrong. Please try again.";
  return MESSAGES[code] ?? "Something went wrong. Please try again.";
}
