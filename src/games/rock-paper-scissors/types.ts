// ============================================================
// Rock Paper Scissors — Game-Specific Types
// ============================================================

export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSState {
  /** Current choices keyed by player ID — null means not yet chosen */
  choices: Record<string, RPSChoice | null>;
  /** Ordered player IDs */
  players: [string, string];
  /** Cumulative scores keyed by player ID */
  scores: Record<string, number>;
  /** Current round number (1-indexed, only increments on decisive rounds) */
  round: number;
  /** Number of round wins needed to win the match (e.g. 2 = best of 3) */
  winsNeeded: number;
  /** 'choosing' = players picking, 'reveal' = showing results */
  phase: 'choosing' | 'reveal';
  /** Result of the last completed round (present during 'reveal' phase) */
  lastResult?: {
    /** Winner player ID, or null if the round was a tie */
    winner: string | null;
    /** Both players' choices */
    choices: Record<string, RPSChoice>;
  };
}

export interface RPSAction {
  type: 'choose';
  choice: RPSChoice;
}
