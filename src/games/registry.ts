// ============================================================
// ArcadeKit — Game Registry
// Central lookup for all built-in games and partner links.
// ============================================================

import type { GameDefinition } from './types';
import type { GameCategory } from '../../shared/gameTypes';

import ticTacToe from './tic-tac-toe';
import rockPaperScissors from './rock-paper-scissors';
import connectFour from './connect-four';
import battleship from './battleship';
import wordScramble from './word-scramble';
import reactionRace from './reaction-race';
import hangman from './hangman';
import ruleOut from './rule-out';

// ------------------------------------------------------------
// Internal registry map (id → definition)
// ------------------------------------------------------------

const games: Record<string, GameDefinition> = {
  [ticTacToe.id]: ticTacToe,
  [rockPaperScissors.id]: rockPaperScissors,
  [connectFour.id]: connectFour,
  [battleship.id]: battleship,
  [wordScramble.id]: wordScramble,
  [reactionRace.id]: reactionRace,
  [hangman.id]: hangman,
  [ruleOut.id]: ruleOut,
};

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

export const gameRegistry = {
  /** Return every registered game definition. */
  all(): GameDefinition[] {
    return Object.values(games);
  },

  /** Look up a single game by its ID. Returns undefined if not found. */
  byId(id: string): GameDefinition | undefined {
    return games[id];
  },

  /** Return all games in a given category. */
  byCategory(category: GameCategory): GameDefinition[] {
    return Object.values(games).filter((g) => g.category === category);
  },

  /** Return all registered game IDs. */
  ids(): string[] {
    return Object.keys(games);
  },
} as const;
