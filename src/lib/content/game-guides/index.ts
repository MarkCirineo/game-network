// ============================================================
// ArcadeKit — Game Guides Index
// Central lookup for all long-form "How to Play" guides.
// ============================================================

import type { GameGuide } from "./types";
import { ticTacToeGuide } from "./tic-tac-toe";
import { rockPaperScissorsGuide } from "./rock-paper-scissors";
import { connectFourGuide } from "./connect-four";
import { battleshipGuide } from "./battleship";
import { wordScrambleGuide } from "./word-scramble";
import { reactionRaceGuide } from "./reaction-race";

export type { GameGuide, HowToStep, StrategyTip, Variation, FaqItem, GearItem, RelatedTool } from "./types";

const guides: Record<string, GameGuide> = {
  [ticTacToeGuide.gameId]: ticTacToeGuide,
  [rockPaperScissorsGuide.gameId]: rockPaperScissorsGuide,
  [connectFourGuide.gameId]: connectFourGuide,
  [battleshipGuide.gameId]: battleshipGuide,
  [wordScrambleGuide.gameId]: wordScrambleGuide,
  [reactionRaceGuide.gameId]: reactionRaceGuide,
};

/** Look up a guide by game ID. Returns undefined if none exists. */
export function getGuide(gameId: string): GameGuide | undefined {
  return guides[gameId];
}

/** All guides, in registry order. */
export function allGuides(): GameGuide[] {
  return Object.values(guides);
}

/** All game IDs that have a guide (used by generateStaticParams). */
export function guideIds(): string[] {
  return Object.keys(guides);
}
