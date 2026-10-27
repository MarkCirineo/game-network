// ============================================================
// ArcadeKit — Pack Passes (server only: uses node:crypto)
// The game server can't see accounts, so the site vouches for the
// host: when a host starts a Rule Out game on a pack that needs an
// account or a purchase, the site checks the account and signs a
// short-lived pass for that board in that room. The game server
// checks the signature before starting the game.
//
// Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256)
// Both sides read PACK_PASS_SECRET. Outside production a fixed dev
// secret is used when it's missing, so local servers need no setup.
// ============================================================

import { createHmac, timingSafeEqual } from "node:crypto";

/** How long a pass stays valid (the host's browser asks for one right before starting) */
export const PACK_PASS_TTL_MS = 10 * 60 * 1000;

const DEV_SECRET = "arcadekit-dev-pack-pass-secret";

interface PackPassPayload {
  /** Board id */
  b: string;
  /** Room code */
  r: string;
  /** Expiry, ms since epoch */
  e: number;
}

function secret(): string | null {
  const value = process.env.PACK_PASS_SECRET;
  if (value) return value;
  return process.env.NODE_ENV === "production" ? null : DEV_SECRET;
}

function sign(data: string, key: string): string {
  return createHmac("sha256", key).update(data).digest("base64url");
}

/** Sign a pass for one board in one room. Throws when the secret is missing in production. */
export function createPackPass(boardId: string, roomCode: string, now = Date.now()): string {
  const key = secret();
  if (!key) throw new Error("PACK_PASS_SECRET is not set");
  const payload: PackPassPayload = { b: boardId, r: roomCode.toUpperCase(), e: now + PACK_PASS_TTL_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, key)}`;
}

/** True when the pass is genuine, unexpired, and for this board in this room. */
export function verifyPackPass(pass: unknown, boardId: string, roomCode: string, now = Date.now()): boolean {
  const key = secret();
  if (!key || typeof pass !== "string" || pass.length > 512) return false;

  const [data, signature, extra] = pass.split(".");
  if (!data || !signature || extra !== undefined) return false;

  const expected = Buffer.from(sign(data, key));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as PackPassPayload;
    return payload.b === boardId && payload.r === roomCode.toUpperCase() && payload.e > now;
  } catch {
    return false;
  }
}
