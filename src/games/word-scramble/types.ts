// ============================================================
// Word Scramble — Game-Specific Types
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

// ── Game Mode ───────────────────────────────────────────────

export type GameMode = 'rounds' | 'firstTo';

export interface GameModeOption {
  label: string;
  value: string; // combined key like 'rounds_5' or 'firstTo_3'
  mode: GameMode;
  target: number;
}

export const GAME_MODE_OPTIONS: readonly GameModeOption[] = [
  { label: '5 Rounds', value: 'rounds_5', mode: 'rounds', target: 5 },
  { label: '10 Rounds', value: 'rounds_10', mode: 'rounds', target: 10 },
  { label: '15 Rounds', value: 'rounds_15', mode: 'rounds', target: 15 },
  { label: 'First to 3', value: 'firstTo_3', mode: 'firstTo', target: 3 },
  { label: 'First to 5', value: 'firstTo_5', mode: 'firstTo', target: 5 },
  { label: 'First to 10', value: 'firstTo_10', mode: 'firstTo', target: 10 },
] as const;

// ── State ───────────────────────────────────────────────────

export interface WordScrambleState {
  /** Current game phase */
  phase: 'playing' | 'reveal' | 'finished';
  /** Current round number (1-based) */
  round: number;
  /** Game mode — fixed rounds or first to X */
  gameMode: GameMode;
  /** Target — round count OR score target */
  target: number;
  /** Selected theme */
  theme: string;
  /** Player scores */
  scores: Record<string, number>;
  /** The correct answer (HIDDEN from clients via getPlayerView) */
  currentWord: string;
  /** Scrambled version visible to all */
  scrambledWord: string;
  /** Who has solved the current round */
  solved: Record<string, boolean>;
  /** Round start timestamp (epoch ms) for countdown */
  roundStartTime: number;
  /** Round duration in ms (default 30000) */
  roundDurationMs: number;
  /** Result of the last completed round */
  lastResult: {
    word: string;
    solverId: string | null;
  } | null;
  /** Ordered player IDs */
  players: string[];
  /** Pre-selected words for all rounds (HIDDEN from clients) */
  words: string[];
  /** Player display names */
  playerNames: Record<string, string>;
}

// ── Actions ─────────────────────────────────────────────────

export interface GuessAction {
  type: 'guess';
  word: string;
}

export interface TimeoutAction {
  type: 'timeout';
}

export interface NextRoundAction {
  type: 'next_round';
}

export type WordScrambleAction = GuessAction | TimeoutAction | NextRoundAction;

// ── Constants ───────────────────────────────────────────────

export const ROUND_DURATION_MS = 30_000;
