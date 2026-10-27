// ============================================================
// ArcadeKit — Board Packs (Rule Out)
// Every board a host can pick, and who can pick it:
//   free     — anyone, no account
//   account  — any signed-in host (free with an account)
//   paid     — hosts who bought the pack
// Only the host needs access: everyone who joins the room plays
// on the host's board, with or without an account.
// A pack's id is its board id.
// ============================================================

export type PackAccess = "free" | "account" | "paid";

export interface BoardPack {
  /** Board id (also the id stored with purchases, so never change it) */
  id: string;
  name: string;
  emoji: string;
  /** One line shown on the pack card */
  tagline: string;
  access: PackAccess;
  /** Price in US cents when bought on its own (paid packs only) */
  priceCents?: number;
}

// Prices aren't final: change them here before launch. Stripe adds
// tax at checkout where it applies.
const PACK_PRICE_CENTS = 299;

/** All paid packs together (only covers packs that exist when bought) */
export const PACK_BUNDLE_PRICE_CENTS = 499;

/** The bundle never costs less than this, however many packs are owned */
const MIN_BUNDLE_PRICE_CENTS = 99;

export const BOARD_PACKS: readonly BoardPack[] = [
  {
    id: "classic",
    name: "Classic",
    emoji: "🙂",
    tagline: "24 everyday faces. Always free.",
    access: "free",
  },
  {
    id: "monster-mash",
    name: "Monster Mash",
    emoji: "🎃",
    tagline: "Friendly monsters with fangs, horns and extra eyes.",
    access: "account",
  },
  {
    id: "dogs",
    name: "Dogs",
    emoji: "🐶",
    tagline: "Floppy ears, spots and collars. Find the good dog.",
    access: "paid",
    priceCents: PACK_PRICE_CENTS,
  },
  {
    id: "fantasy",
    name: "Fantasy",
    emoji: "🧙",
    tagline: "Wizards, knights and elves from a far-off realm.",
    access: "paid",
    priceCents: PACK_PRICE_CENTS,
  },
];

export function getPack(id: unknown): BoardPack | undefined {
  return typeof id === "string" ? BOARD_PACKS.find((p) => p.id === id) : undefined;
}

/** Packs that have to be bought */
export const PAID_PACK_IDS: readonly string[] = BOARD_PACKS.filter((p) => p.access === "paid").map(
  (p) => p.id,
);

/**
 * What "all packs" costs someone who already owns some of them: the
 * bundle price minus what the owned packs cost on their own, but never
 * more than buying the missing ones separately. Null when nothing is
 * missing, or only one pack is (then it's just that pack).
 */
export function bundlePriceCents(owned: ReadonlySet<string>): number | null {
  const paid = BOARD_PACKS.filter((p) => p.access === "paid");
  const missing = paid.filter((p) => !owned.has(p.id));
  if (missing.length < 2) return null;
  const total = (packs: BoardPack[]) => packs.reduce((sum, p) => sum + (p.priceCents ?? 0), 0);
  const ownedValue = total(paid.filter((p) => owned.has(p.id)));
  const separately = total(missing);
  return Math.min(separately, Math.max(PACK_BUNDLE_PRICE_CENTS - ownedValue, MIN_BUNDLE_PRICE_CENTS));
}

/** "$2.99" */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
