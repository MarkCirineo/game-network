// ============================================================
// Reaction Race — Shared Types
// ============================================================

/** Server-side phase (note: 'waiting' covers both WAIT and GO visual states) */
export type RacePhase = 'waiting' | 'result' | 'finished';

export type GameMode = 'rounds' | 'firstTo';

export type ReactionValue = number | 'false_start' | 'no_reaction' | null;

export interface ReactionRaceState {
  phase: RacePhase;
  round: number;
  gameMode: GameMode;
  target: number;
  scores: Record<string, number>;
  /** Epoch ms when GO triggers (server-determined, sent to clients) */
  goTime: number;
  /** Delay before GO in ms (2000–5000) — for client display */
  delay: number;
  /** Player reactions: ms if reacted, 'false_start' if early, 'no_reaction' if timed out, null if pending */
  reactions: Record<string, ReactionValue>;
  /** Result of the last completed round */
  lastResult: {
    winnerId: string | null;
    reactions: Record<string, number | 'false_start' | 'no_reaction'>;
  } | null;
  /** Epoch ms when countdown started (for "Get Ready" timer) */
  countdownStartTime: number;
  players: string[];
  playerNames: Record<string, string>;
}

export type ReactionRaceAction =
  | { type: 'react'; reactionTime: number }   // client-measured ms (negative = false start)
  | { type: 'timeout' }                       // round timed out
  | { type: 'next_round' };                   // advance phases
