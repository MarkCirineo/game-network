// ============================================================
// ArcadeKit — Rule Out: Shared Types
// State and action shapes shared by the game server engine and
// the client UI. Hidden information (secret cards, each player's
// ruled-out cards) is stripped per viewer by getPlayerView.
// ============================================================

import type { BoardCard, SuggestedQuestion } from './boards/types.js';

export type { BoardCard, SuggestedQuestion };

/**
 * free      — players talk out loud (or on a call); anyone can make a
 *             final guess at any time.
 * questions — players take turns asking yes/no questions in the app.
 */
export type RuleOutMode = 'free' | 'questions';

export const RULE_OUT_MAX_QUESTION_LENGTH = 120;
/** Answered questions kept in state (oldest are dropped first) */
export const RULE_OUT_MAX_HISTORY = 50;

export interface RuleOutQuestion {
  askerId: string;
  text: string;
  answer: 'yes' | 'no' | null;
}

export interface RuleOutResult {
  guesserId: string;
  guessedCardId: string;
  correct: boolean;
  winnerId: string;
}

export interface RuleOutState {
  phase: 'playing' | 'finished';
  mode: RuleOutMode;
  /** Snapshot of the board for this game (cards travel with the state) */
  board: {
    id: string;
    name: string;
    cards: BoardCard[];
    questions: SuggestedQuestion[];
  };
  players: [string, string];
  playerNames: Record<string, string>;
  /**
   * Secret card per player. In a player's view this holds only their
   * own card until the game ends, then both.
   */
  secrets: Record<string, string>;
  /** Cards each player has ruled out. A view holds only the viewer's own. */
  ruledOut: Record<string, string[]>;
  /** Cards still standing per player (public) */
  remaining: Record<string, number>;
  /** Player whose turn it is in questions mode; '' in free mode */
  currentTurn: string;
  pendingQuestion: RuleOutQuestion | null;
  /** Answered questions, oldest first */
  history: RuleOutQuestion[];
  result: RuleOutResult | null;
}

export type RuleOutAction =
  | { type: 'toggle'; cardId: string }
  | { type: 'ask'; text: string }
  | { type: 'answer'; answer: 'yes' | 'no' }
  | { type: 'guess'; cardId: string };

/** Trim, collapse whitespace, and cap a question's length. */
export function normalizeQuestion(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, RULE_OUT_MAX_QUESTION_LENGTH);
}
