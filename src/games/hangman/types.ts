// ============================================================
// Hangman — Game-Specific Types
// ============================================================

// ── Themes ──────────────────────────────────────────────────

export type Theme =
  | 'random'
  | 'animals'
  | 'food'
  | 'countries'
  | 'sports'
  | 'science'
  | 'entertainment';

export interface ThemeMeta {
  id: Theme;
  label: string;
  emoji: string;
}

export const THEMES: readonly ThemeMeta[] = [
  { id: 'random', label: 'Random', emoji: '🎲' },
  { id: 'animals', label: 'Animals', emoji: '🐾' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'countries', label: 'Countries', emoji: '🌍' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
] as const;

// ── State ───────────────────────────────────────────────────

export interface HangmanState {
  /** Current game phase */
  phase: 'playing' | 'reveal' | 'finished';
  /** Current round number (1-based) */
  round: number;
  /** Total rounds in the match */
  totalRounds: number;
  /** Selected theme */
  theme: string;
  /** Strikes that complete the gallows (6 / 8 / 10) */
  maxStrikes: number;
  /** Wrong guesses so far this round (shared gallows) */
  strikes: number;
  /**
   * The word. While playing, the server masks unguessed letters
   * as underscores (e.g. "e_e___nt"); during reveal it is the
   * full answer.
   */
  word: string;
  /** Every letter guessed this round, in order (lowercase) */
  guessedLetters: string[];
  /** Player ID whose turn it is */
  currentTurn: string;
  /** Player scores */
  scores: Record<string, number>;
  /** Result of the last completed round */
  lastResult: {
    word: string;
    outcome: 'solved' | 'hanged';
    solverId: string | null;
  } | null;
  /** Ordered player IDs */
  players: string[];
  /** Player display names */
  playerNames: Record<string, string>;
  /** Word list — always empty on the client (hidden server-side) */
  words: string[];
}

// ── Actions ─────────────────────────────────────────────────

export interface GuessLetterAction {
  type: 'guess_letter';
  letter: string;
}

export interface GuessWordAction {
  type: 'guess_word';
  word: string;
}

export interface NextRoundAction {
  type: 'next_round';
}

export type HangmanAction = GuessLetterAction | GuessWordAction | NextRoundAction;

// ── Scoring constants (mirror the server engine) ───────────

export const LETTER_POINTS = 10;
export const COMPLETION_BONUS = 20;
export const SOLVE_POINTS_PER_LETTER = 20;
