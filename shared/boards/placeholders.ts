// ============================================================
// ArcadeKit — Placeholder Pack Boards (Rule Out)
// TEMPORARY: stand-ins for Dogs and Fantasy until
// their art exists. Each one reuses the classic portraits and tags
// under its own id and card names, so the pack system can be built
// and tested end to end. Replace each with a real board file
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

export const dogsBoard = placeholderBoard("dogs", "Dogs", [
  "Biscuit", "Daisy", "Rocky", "Luna", "Max", "Pepper", "Buddy", "Coco",
  "Duke", "Rosie", "Bear", "Penny", "Scout", "Lola", "Tucker", "Ginger",
  "Ziggy", "Maple", "Otis", "Waffles", "Bandit", "Nala", "Ollie", "Pickles",
]);

export const fantasyBoard = placeholderBoard("fantasy", "Fantasy", [
  "Alaric", "Brenna", "Cedric", "Dwyn", "Elowen", "Faelan", "Gorrin", "Hilda",
  "Isolde", "Jorund", "Kael", "Lyra", "Merrin", "Nyx", "Orrin", "Pell",
  "Quill", "Rowan", "Sable", "Thorne", "Ulric", "Vesna", "Wren", "Ysolde",
]);
