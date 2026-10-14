// ============================================================
// ArcadeKit — Server-Side Analytics
// Sends gameplay events straight to Umami's /api/send endpoint.
// The server sees every game exactly once, so these counts don't
// depend on players' browsers or ad blockers.
//
// Only sends in production. Elsewhere it logs the event instead,
// so you can watch events locally without polluting real data.
// ============================================================

import {
  UMAMI_ORIGIN,
  UMAMI_WEBSITE_ID,
  type EventData,
  type ServerEvents,
} from '../../shared/analytics.js';

const ENABLED = process.env.NODE_ENV === 'production' && process.env.UMAMI_DISABLED !== 'true';
const UMAMI_URL = process.env.UMAMI_URL || UMAMI_ORIGIN;
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || UMAMI_WEBSITE_ID;
const SITE_HOSTNAME = process.env.UMAMI_HOSTNAME || 'arcadekit.games';

/**
 * Umami ignores requests whose User-Agent looks like a bot, which
 * includes Node's default. A plain desktop browser string gets the
 * event counted; it shows up as Linux/Chrome in device reports.
 */
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const REQUEST_TIMEOUT_MS = 5_000;

/** Only log the first failure in a row, so an Umami outage doesn't flood the logs */
let lastSendFailed = false;

/**
 * Record a gameplay event. Fire-and-forget: never throws and never
 * delays the game.
 */
export function trackServerEvent<E extends keyof ServerEvents>(
  event: E,
  data: ServerEvents[E] & EventData,
): void {
  if (!ENABLED) {
    console.log(`[Analytics] ${event} ${JSON.stringify(data)}`);
    return;
  }

  // Attribute the event to the game's page, so Umami can also break
  // events down by URL
  const game = typeof data.game === 'string' ? data.game : undefined;
  const path = game ? `/games/${game}` : '/';

  fetch(`${UMAMI_URL}/api/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({
      type: 'event',
      payload: {
        website: WEBSITE_ID,
        hostname: SITE_HOSTNAME,
        url: `https://${SITE_HOSTNAME}${path}`,
        language: 'en-US',
        screen: '0x0',
        name: event,
        data,
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      lastSendFailed = false;
    })
    .catch((err) => {
      if (!lastSendFailed) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[Analytics] Failed to send "${event}": ${msg}`);
      }
      lastSendFailed = true;
    });
}
