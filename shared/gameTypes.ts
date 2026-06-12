// ============================================================
// ArcadeKit — Game Type Definitions
// Shared between client and game server
// ============================================================

import type { PlayerInfo, SpectatorInfo, GameStatus } from './messages';

// Re-export for convenience
export type { PlayerInfo, SpectatorInfo, GameStatus };

// ------------------------------------------------------------
// Game Categories
// ------------------------------------------------------------

export type GameCategory =
  | 'quick'      // < 2 min games (RPS, coin flip)
  | 'strategy'   // Thinking games (TTT, Connect Four)
  | 'party'      // 3+ player social games
  | 'word'       // Word-based games
  | 'trivia'     // Knowledge games
  | 'creative';  // Drawing, storytelling

// ------------------------------------------------------------
// Partner / External Games
// ------------------------------------------------------------

export interface PartnerGame {
  name: string;
  description: string;
  emoji: string;
  url: string;
  accentColor: string;
}
