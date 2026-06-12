// ============================================================
// ArcadeKit — Game Registry
// Central lookup for all built-in games and partner links.
// ============================================================

import type { GameDefinition } from './types';
import type { PartnerGame, GameCategory } from '../../shared/gameTypes';

import ticTacToe from './tic-tac-toe';
import rockPaperScissors from './rock-paper-scissors';

// ------------------------------------------------------------
// Internal registry map (id → definition)
// ------------------------------------------------------------

const games: Record<string, GameDefinition> = {
  [ticTacToe.id]: ticTacToe,
  [rockPaperScissors.id]: rockPaperScissors,
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

// ------------------------------------------------------------
// Partner / External Games
// ------------------------------------------------------------

export const partnerGames: PartnerGame[] = [
  {
    name: 'Guess Who',
    description:
      'The classic deduction game — ask yes-or-no questions to figure out your opponent\'s mystery character before they guess yours.',
    emoji: '🔎',
    url: 'https://playguesswho.net',
    accentColor: '#8B5CF6',
  },
];
