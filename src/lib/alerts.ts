// ============================================================
// ArcadeKit — Operator alerts (server only)
// Posts short warnings to a private Discord channel. Uses
// DISCORD_ALERTS_WEBHOOK_URL, falling back to the feedback webhook.
// Each alert key is sent at most once per cooldown, so a burst of
// failures doesn't flood the channel.
// ============================================================

const COOLDOWN_MS = 15 * 60 * 1000;
const lastSent = new Map<string, number>();

export async function sendAlert(key: string, message: string): Promise<void> {
  const now = Date.now();
  const previous = lastSent.get(key);
  if (previous && now - previous < COOLDOWN_MS) return;
  lastSent.set(key, now);

  const webhookUrl =
    process.env.DISCORD_ALERTS_WEBHOOK_URL || process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(`[ArcadeKit] Alert (no webhook set): ${message}`);
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `⚠️ **ArcadeKit:** ${message}` }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error("[ArcadeKit] Failed to send alert:", error);
  }
}
