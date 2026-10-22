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
}

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
  },
  {
    id: "fantasy",
    name: "Fantasy",
    emoji: "🧙",
    tagline: "Wizards, knights and elves from a far-off realm.",
    access: "paid",
  },
];

export function getPack(id: unknown): BoardPack | undefined {
  return typeof id === "string" ? BOARD_PACKS.find((p) => p.id === id) : undefined;
}

/** Packs that have to be bought */
export const PAID_PACK_IDS: readonly string[] = BOARD_PACKS.filter((p) => p.access === "paid").map(
  (p) => p.id,
);
