// ============================================================
// ArcadeKit — Engine Registry
// Maps game IDs (strings) to their GameEngine instances.
// Add new games here as they are implemented.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import { TicTacToeEngine } from './TicTacToeEngine.js';
import { RockPaperScissorsEngine } from './RockPaperScissorsEngine.js';
import { ConnectFourEngine } from './ConnectFourEngine.js';
import { BattleshipEngine } from './BattleshipEngine.js';

/**
 * Registry of all available game engines, keyed by game ID.
 * Game IDs must match the identifiers used by the frontend.
 */
const engineRegistry: Map<string, GameEngine> = new Map();

// Register built-in engines
engineRegistry.set('tic-tac-toe', new TicTacToeEngine());
engineRegistry.set('rock-paper-scissors', new RockPaperScissorsEngine());
engineRegistry.set('connect-four', new ConnectFourEngine());
engineRegistry.set('battleship', new BattleshipEngine());

/**
 * Retrieve a game engine by its game ID.
 * @returns The engine instance, or undefined if not found.
 */
export function getEngine(gameId: string): GameEngine | undefined {
  return engineRegistry.get(gameId);
}

/**
 * Check if a game ID has a registered engine.
 */
export function hasEngine(gameId: string): boolean {
  return engineRegistry.has(gameId);
}

/**
 * Get all registered game IDs.
 */
export function getRegisteredGameIds(): string[] {
  return Array.from(engineRegistry.keys());
}
