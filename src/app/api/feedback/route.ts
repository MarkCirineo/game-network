// ============================================================
// ArcadeKit — Feedback API Route
// POST /api/feedback — forwards a bug report / idea from the
// footer form to a private Discord channel via webhook.
// The webhook URL is a server-only secret (never NEXT_PUBLIC_).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  FEEDBACK_LABELS,
  FEEDBACK_MAX_LENGTH,
  isFeedbackType,
  type FeedbackType,
} from "@/lib/feedback";

const EMBED_COLORS: Record<FeedbackType, number> = {
  bug: 0xef4444, // red
  idea: 0xf59e0b, // amber
  other: 0x64748b, // slate
};

// In-memory rate limit: a few submissions per IP per window. Resets on
// restart, which is fine — this only has to stop casual spam.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const recentSubmissions = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): boolean {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Drop stale entries so the map can't grow without bound
  for (const [key, times] of recentSubmissions) {
    if (times[times.length - 1] <= windowStart) recentSubmissions.delete(key);
  }

  const times = (recentSubmissions.get(ip) ?? []).filter((t) => t > windowStart);
  if (times.length >= RATE_LIMIT_MAX) return true;

  times.push(now);
  recentSubmissions.set(ip, times);
  return false;
}

function getClientIp(request: NextRequest): string {
  // nginx sets X-Real-IP to the connecting address
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

/** Keep only short, plain strings from the client-supplied context. */
function cleanString(value: unknown, maxLength: number, pattern?: RegExp): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  if (!trimmed || (pattern && !pattern.test(trimmed))) return undefined;
  return trimmed;
}

function buildDiscordMessage(fields: {
  type: FeedbackType;
  message: string;
  path?: string;
  gameId?: string;
  roomCode?: string;
  viewport?: string;
  userAgent?: string;
}) {
  const { emoji, label } = FEEDBACK_LABELS[fields.type];
  const context = [
    { name: "Page", value: fields.path, inline: true },
    { name: "Game", value: fields.gameId, inline: true },
    { name: "Room", value: fields.roomCode, inline: true },
    { name: "Screen", value: fields.viewport, inline: true },
    { name: "Browser", value: fields.userAgent, inline: false },
  ].filter((f): f is { name: string; value: string; inline: boolean } => !!f.value);

  return {
    // Never let message text ping @everyone / roles / users
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: `${emoji} ${label}`,
        description: fields.message,
        color: EMBED_COLORS[fields.type],
        fields: context,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot filled in → almost certainly a bot. Pretend it worked.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { type } = body;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!isFeedbackType(type) || !message || message.length > FEEDBACK_MAX_LENGTH) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  if (isRateLimited(getClientIp(request), Date.now())) {
    return NextResponse.json(
      { error: "You've sent a lot of feedback recently — please try again in a few minutes." },
      { status: 429 }
    );
  }

  const discordMessage = buildDiscordMessage({
    type,
    message,
    path: cleanString(body.path, 200, /^\//),
    gameId: cleanString(body.gameId, 40, /^[a-z0-9-]+$/),
    roomCode: cleanString(body.roomCode, 12, /^[A-Za-z0-9]+$/),
    viewport: cleanString(body.viewport, 20, /^\d+x\d+$/),
    userAgent: cleanString(request.headers.get("user-agent"), 300),
  });

  const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) {
    // Local dev without a webhook: log it so the form can still be tested
    if (process.env.NODE_ENV !== "production") {
      console.log("[ArcadeKit] Feedback (no webhook set):", JSON.stringify(discordMessage.embeds[0], null, 2));
      return NextResponse.json({ ok: true });
    }
    console.error("[ArcadeKit] DISCORD_FEEDBACK_WEBHOOK_URL is not set");
    return NextResponse.json({ error: "Feedback isn't available right now." }, { status: 503 });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordMessage),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[ArcadeKit] Discord webhook returned ${res.status}: ${await res.text()}`);
      return NextResponse.json({ error: "Couldn't send feedback. Please try again." }, { status: 502 });
    }
  } catch (error) {
    console.error("[ArcadeKit] Discord webhook error:", error);
    return NextResponse.json({ error: "Couldn't send feedback. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
