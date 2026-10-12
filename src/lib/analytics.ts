// ============================================================
// ArcadeKit — Analytics Helper
// Thin wrapper around Umami's custom events. The Umami script only
// loads in production (see layout.tsx) and loads after hydration,
// so events fired on mount wait briefly for it to appear.
// ============================================================

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

const RETRY_INTERVAL_MS = 200;
const MAX_ATTEMPTS = 50; // ~10 seconds

/**
 * Send a Umami custom event. If the script hasn't loaded yet, retry
 * for a few seconds, then give up silently (dev, ad blockers).
 */
export function trackEvent(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  let attempts = 0;
  const send = () => {
    if (window.umami) {
      window.umami.track(event, data);
      return;
    }
    attempts += 1;
    if (attempts < MAX_ATTEMPTS) setTimeout(send, RETRY_INTERVAL_MS);
  };
  send();
}
