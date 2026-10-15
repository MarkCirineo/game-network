// ============================================================
// ArcadeKit — Username holds (server only)
// After a rename or account deletion, the old username is held for
// USERNAME_HOLD_DAYS: nobody else can take it, so a known player's
// name can't be grabbed and used to pass as them. The previous owner
// can still take it back.
// ============================================================

import { and, eq, gt, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { releasedUsername } from "@/lib/db/schema";
import { USERNAME_HOLD_DAYS } from "./index";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Hold a username that its owner just gave up (null owner = account deleted). */
export async function holdReleasedUsername(username: string, releasedBy: string | null): Promise<void> {
  const name = username.toLowerCase();
  const now = new Date();
  const availableAt = new Date(now.getTime() + USERNAME_HOLD_DAYS * DAY_MS);
  await db
    .insert(releasedUsername)
    .values({ username: name, releasedBy, releasedAt: now, availableAt })
    .onConflictDoUpdate({
      target: releasedUsername.username,
      set: { releasedBy, releasedAt: now, availableAt },
    });
}

/**
 * True when `username` is on hold for someone other than `userId`.
 * Clears expired holds on the way.
 */
export async function isUsernameHeld(username: string, userId: string): Promise<boolean> {
  const name = username.toLowerCase();
  const now = new Date();
  await db.delete(releasedUsername).where(lte(releasedUsername.availableAt, now));

  const [hold] = await db
    .select({ releasedBy: releasedUsername.releasedBy })
    .from(releasedUsername)
    .where(and(eq(releasedUsername.username, name), gt(releasedUsername.availableAt, now)));

  return Boolean(hold) && hold.releasedBy !== userId;
}

/** The owner took their old name back: the hold is no longer needed. */
export async function clearUsernameHold(username: string): Promise<void> {
  await db.delete(releasedUsername).where(eq(releasedUsername.username, username.toLowerCase()));
}
