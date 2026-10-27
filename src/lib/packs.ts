// ============================================================
// ArcadeKit — Rule Out Board Packs (server only)
// Which packs an account can host, from the pack list in
// shared/boards/packs.ts and the owned_pack table.
// ============================================================

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ownedPack } from "@/lib/db/schema";
import { BOARD_PACKS, type BoardPack } from "../../shared/boards/packs";

/**
 * Why a pack is or isn't available to a host:
 *   unlocked — they can host it
 *   sign-in  — free, but only with an account
 *   buy      — has to be bought
 */
export type PackStatus = "unlocked" | "sign-in" | "buy";

export interface PackWithStatus extends BoardPack {
  status: PackStatus;
  /** True when the account owns this pack (bought or granted) */
  owned: boolean;
}

/** Pack ids the account owns */
export async function ownedPackIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ packId: ownedPack.packId })
    .from(ownedPack)
    .where(eq(ownedPack.userId, userId));
  return new Set(rows.map((r) => r.packId));
}

export function packStatus(pack: BoardPack, signedIn: boolean, owned: Set<string>): PackStatus {
  if (pack.access === "free") return "unlocked";
  if (!signedIn) return pack.access === "account" ? "sign-in" : "buy";
  if (pack.access === "account" || owned.has(pack.id)) return "unlocked";
  return "buy";
}

/** Every pack with its status for this viewer (null = signed out) */
export async function packsFor(userId: string | null): Promise<PackWithStatus[]> {
  const owned = userId ? await ownedPackIds(userId) : new Set<string>();
  return BOARD_PACKS.map((pack) => ({
    ...pack,
    status: packStatus(pack, userId !== null, owned),
    owned: owned.has(pack.id),
  }));
}
