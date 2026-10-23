// ============================================================
// ArcadeKit — Placeholder Pack Boards (Rule Out)
// TEMPORARY: a stand-in for Fantasy until
// its art exists. It reuses the classic portraits and tags
// under its own id and card names, so the pack system can be built
// and tested end to end. Replace it with a real board file
// (like classic.ts) before launch.
// ============================================================

import type { Board } from "./types.js";
import { classicBoard } from "./classic.js";

function placeholderBoard(id: string, name: string, cardNames: string[]): Board {
  return {
    id,
    name,
    cards: classicBoard.cards.map((card, i) => ({
      ...card,
      name: cardNames[i % cardNames.length],
    })),
    questions: classicBoard.questions,
  };
}

export const fantasyBoard = placeholderBoard("fantasy", "Fantasy", [
  "Alaric", "Brenna", "Cedric", "Dwyn", "Elowen", "Faelan", "Gorrin", "Hilda",
  "Isolde", "Jorund", "Kael", "Lyra", "Merrin", "Nyx", "Orrin", "Pell",
  "Quill", "Rowan", "Sable", "Thorne", "Ulric", "Vesna", "Wren", "Ysolde",
]);
