// ============================================================
// ArcadeKit — Built-in Boards (Rule Out)
// Which boards a host may pick is decided in packs.ts.
// ============================================================

import type { Board } from "./types.js";
import { classicBoard } from "./classic.js";
import { monsterMashBoard } from "./monsterMash.js";
import { dogsBoard, fantasyBoard } from "./placeholders.js";

export type { Board, BoardCard, SuggestedQuestion } from "./types.js";

export const DEFAULT_BOARD_ID = "classic";

const boards: Record<string, Board> = {
  [classicBoard.id]: classicBoard,
  [monsterMashBoard.id]: monsterMashBoard,
  [dogsBoard.id]: dogsBoard,
  [fantasyBoard.id]: fantasyBoard,
};

/** Look up a built-in board, falling back to the default. */
export function getBoard(id: unknown): Board {
  return (typeof id === "string" && boards[id]) || boards[DEFAULT_BOARD_ID];
}
