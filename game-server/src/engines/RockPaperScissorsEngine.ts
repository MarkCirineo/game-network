// ============================================================
// ArcadeKit — Rock-Paper-Scissors Engine
// Simultaneous-choice game, best of 3 (first to 2 wins).
// Both players submit choices, server reveals when both arrive.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';

// ------------------------------------------------------------
// State shape
// ------------------------------------------------------------

export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSState {
  /** Each player's current choice (null = hasn't chosen yet) */
  choices: Record<string, RPSChoice | null>;
  /** Ordered player IDs */
  players: [string, string];
  /** Cumulative scores (rounds won) */
  scores: Record<string, number>;
  /** Current round number (1-based) */
  round: number;
  /** How many round wins needed to win the match (default: 2 for best-of-3) */
  maxRounds: number;
  /** Round phase: choosing = waiting for picks, reveal = showing results */
  phase: 'choosing' | 'reveal';
  /** Result of the last completed round (for UI display) */
  lastResult?: {
    choices: Record<string, RPSChoice>;
    winner: string | null; // null = tie
  };
}

export interface RPSAction {
  choice: RPSChoice;
}

const VALID_CHOICES: ReadonlySet<string> = new Set(['rock', 'paper', 'scissors']);

/**
 * Determine the winner of a single RPS round.
 * @returns ID of the winner, or null if it's a tie.
 */
function resolveRound(
  p1Id: string, p1Choice: RPSChoice,
  p2Id: string, p2Choice: RPSChoice,
): string | null {
  if (p1Choice === p2Choice) return null;

  const winsAgainst: Record<RPSChoice, RPSChoice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  };

  return winsAgainst[p1Choice] === p2Choice ? p1Id : p2Id;
}

// ------------------------------------------------------------
// Engine implementation
// ------------------------------------------------------------

export class RockPaperScissorsEngine extends GameEngine {
  readonly name = 'Rock Paper Scissors';
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  createInitialState(players: PlayerInfo[]): RPSState {
    const p1 = players[0].id;
    const p2 = players[1].id;
    return {
      choices: { [p1]: null, [p2]: null },
      players: [p1, p2],
      scores: { [p1]: 0, [p2]: 0 },
      round: 1,
      maxRounds: 2, // first to 2 wins (best-of-3)
      phase: 'choosing',
    };
  }

  validateAction(state: unknown, action: unknown, playerId: string): boolean {
    const s = state as RPSState;
    const a = action as RPSAction;

    // Must be in the choosing phase
    if (s.phase !== 'choosing') return false;

    // Player must be a participant
    if (!s.players.includes(playerId)) return false;

    // Player must not have already chosen this round
    if (s.choices[playerId] !== null) return false;

    // Choice must be valid
    if (!a.choice || !VALID_CHOICES.has(a.choice)) return false;

    return true;
  }

  applyAction(state: unknown, action: unknown, playerId: string): RPSState {
    const s = state as RPSState;
    const a = action as RPSAction;

    // Record this player's choice
    const newChoices = { ...s.choices, [playerId]: a.choice };

    const p1 = s.players[0];
    const p2 = s.players[1];
    const p1Choice = newChoices[p1];
    const p2Choice = newChoices[p2];

    // If only one player has chosen, stay in choosing phase
    if (p1Choice === null || p2Choice === null) {
      return { ...s, choices: newChoices };
    }

    // Both players have chosen — resolve the round
    const roundWinner = resolveRound(p1, p1Choice, p2, p2Choice);
    const newScores = { ...s.scores };
    if (roundWinner) {
      newScores[roundWinner] = (newScores[roundWinner] || 0) + 1;
    }

    const lastResult = {
      choices: { [p1]: p1Choice, [p2]: p2Choice } as Record<string, RPSChoice>,
      winner: roundWinner,
    };

    // Check if match is over (someone reached maxRounds wins)
    const matchOver = newScores[p1] >= s.maxRounds || newScores[p2] >= s.maxRounds;

    if (matchOver) {
      // Stay in reveal phase with final scores; getGameStatus will report game over
      return {
        ...s,
        choices: newChoices,
        scores: newScores,
        phase: 'reveal',
        lastResult,
      };
    }

    // Match continues — reset choices for the next round
    return {
      ...s,
      choices: { [p1]: null, [p2]: null },
      scores: newScores,
      round: s.round + 1,
      phase: 'choosing',
      lastResult,
    };
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as RPSState;

    const p1 = s.players[0];
    const p2 = s.players[1];

    // Check if someone reached the required number of wins
    if (s.scores[p1] >= s.maxRounds) {
      return {
        isOver: true,
        winnerId: p1,
        scores: s.scores,
        reason: `Won ${s.scores[p1]}–${s.scores[p2]}`,
      };
    }
    if (s.scores[p2] >= s.maxRounds) {
      return {
        isOver: true,
        winnerId: p2,
        scores: s.scores,
        reason: `Won ${s.scores[p2]}–${s.scores[p1]}`,
      };
    }

    return { isOver: false, scores: s.scores };
  }

  /**
   * Hide the opponent's choice while in the choosing phase.
   * During reveal phase, show everything.
   */
  getPlayerView(state: unknown, playerId: string): unknown {
    const s = state as RPSState;
    if (s.phase === 'reveal') return s;

    // In choosing phase, hide whether the opponent has chosen
    const sanitizedChoices: Record<string, RPSChoice | null> = {};
    for (const pid of s.players) {
      sanitizedChoices[pid] = pid === playerId ? s.choices[pid] : null;
    }

    return { ...s, choices: sanitizedChoices };
  }
}
