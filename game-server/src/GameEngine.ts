// ============================================================
// ArcadeKit — Abstract Game Engine Interface
// Stateless game logic: pure functions operating on state objects.
// Each concrete engine (TicTacToe, RPS, etc.) implements this.
// ============================================================

import type { PlayerInfo, GameStatus } from '../../shared/messages.js';

/**
 * Abstract base class for game engines.
 *
 * Engines are stateless — they receive state, compute results, and
 * return new state. All mutation happens through applyAction, which
 * returns a fresh state object.
 */
export abstract class GameEngine {
  /** Human-readable engine name (for logging) */
  abstract readonly name: string;

  /** Minimum players required to start */
  abstract readonly minPlayers: number;

  /** Maximum players supported */
  abstract readonly maxPlayers: number;

  /**
   * Create the initial game state for a new round.
   * @param players - Array of players participating in this round
   * @returns The initial game state (shape is engine-specific)
   */
  abstract createInitialState(players: PlayerInfo[]): unknown;

  /**
   * Validate whether an action is legal given the current state.
   * This should NOT mutate state — it is a pure predicate.
   *
   * @param state    - Current game state
   * @param action   - The action the player wants to perform
   * @param playerId - ID of the player attempting the action
   * @returns true if the action is valid, false otherwise
   */
  abstract validateAction(state: unknown, action: unknown, playerId: string): boolean;

  /**
   * Apply a validated action to produce the next game state.
   * Callers should validate first via validateAction().
   *
   * @param state    - Current game state
   * @param action   - The validated action to apply
   * @param playerId - ID of the acting player
   * @returns New game state (must not mutate the input)
   */
  abstract applyAction(state: unknown, action: unknown, playerId: string): unknown;

  /**
   * Inspect the current state to determine if the game is over.
   *
   * @param state - Current game state
   * @returns GameStatus indicating win/draw/ongoing status
   */
  abstract getGameStatus(state: unknown): GameStatus;

  /**
   * Optional: return a sanitized view of the state for a specific player.
   * Useful for games with hidden information (e.g., hiding opponent's hand).
   * Default implementation returns the full state (no hiding).
   *
   * @param state    - Full game state
   * @param playerId - The player requesting the view
   * @returns The state as this player should see it
   */
  getPlayerView(state: unknown, _playerId: string): unknown {
    return state;
  }
}
