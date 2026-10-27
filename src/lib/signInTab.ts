// ============================================================
// ArcadeKit — Signing in from another tab
// A host in a game lobby signs in in a new tab, so the lobby tab keeps
// its place in the room. The new tab ends on /signed-in, which tells
// the lobby tab (same browser) that the account changed.
// ============================================================

/** Where the sign-in tab lands once it's done */
export const SIGNED_IN_PATH = "/signed-in";

const CHANNEL = "arcadekit-sign-in";

/** Sign-in link that opens in a new tab and ends on /signed-in */
export const SIGN_IN_TAB_HREF = `/sign-in?next=${encodeURIComponent(SIGNED_IN_PATH)}`;

/**
 * Open the sign-in tab from a script, so /signed-in is allowed to
 * close it again. Returns false if the browser blocked the new tab.
 */
export function openSignInTab(): boolean {
  return window.open(SIGN_IN_TAB_HREF, "_blank") !== null;
}

/** Tell this browser's other tabs that an account just signed in */
export function announceSignIn(): void {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage("signed-in");
  channel.close();
}

/** Call `onSignIn` when another tab announces a sign-in. Returns the cleanup. */
export function listenForSignIn(onSignIn: () => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = () => onSignIn();
  return () => channel.close();
}
