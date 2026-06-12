// ============================================================
// ArcadeKit — Tic-Tac-Toe Engine
// Classic 3x3 grid game. Two players alternate placing marks.
// First to get 3 in a row wins; all cells filled = draw.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';

// ------------------------------------------------------------
// State shape
// ------------------------------------------------------------

export interface TicTacToeState {
  /** 9-cell board, null = empty, otherwise player ID */
  board: (string | null)[];
  /** Player ID whose turn it is */
  currentTurn: string;
  /** Ordered player IDs: [0] goes first (X), [1] goes second (O) */
  players: [string, string];
  /** Total moves made so far */
  moveCount: number;
}

export interface TicTacToeAction {
  /** Cell index 0–8 (left-to-right, top-to-bottom) */
  cell: number;
}

// The 8 winning lines (indices into the 9-cell board)
const WIN_LINES: readonly [number, number, number][] = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left col
  [1, 4, 7], // center col
  [2, 5, 8], // right col
  [0, 4, 8], // diagonal TL→BR
  [2, 4, 6], // diagonal TR→BL
];

// ------------------------------------------------------------
// Engine implementation
// ------------------------------------------------------------

export class TicTacToeEngine extends GameEngine {
  readonly name = 'Tic-Tac-Toe';
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  createInitialState(players: PlayerInfo[]): TicTacToeState {
    return {
      board: Array(9).fill(null) as (string | null)[],
      currentTurn: players[0].id,
      players: [players[0].id, players[1].id],
      moveCount: 0,
    };
  }

  validateAction(state: unknown, action: unknown, playerId: string): boolean {
    const s = state as TicTacToeState;
    const a = action as TicTacToeAction;

    // Must be this player's turn
    if (s.currentTurn !== playerId) return false;

    // Cell index must be 0–8
    if (typeof a.cell !== 'number' || a.cell < 0 || a.cell > 8 || !Number.isInteger(a.cell)) {
      return false;
    }

    // Cell must be empty
    if (s.board[a.cell] !== null) return false;

    return true;
  }

  applyAction(state: unknown, action: unknown, playerId: string): TicTacToeState {
    const s = state as TicTacToeState;
    const a = action as TicTacToeAction;

    // Clone board (immutable update)
    const newBoard = [...s.board];
    newBoard[a.cell] = playerId;

    // Switch turn to the other player
    const nextTurn = s.players[0] === playerId ? s.players[1] : s.players[0];

    return {
      board: newBoard,
      currentTurn: nextTurn,
      players: s.players,
      moveCount: s.moveCount + 1,
    };
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as TicTacToeState;

    // Check each winning line
    for (const [a, b, c] of WIN_LINES) {
      if (s.board[a] !== null && s.board[a] === s.board[b] && s.board[b] === s.board[c]) {
        return {
          isOver: true,
          winnerId: s.board[a],
          reason: 'Three in a row!',
        };
      }
    }

    // Check for draw (all 9 cells filled, no winner)
    if (s.moveCount >= 9) {
      return {
        isOver: true,
        winnerId: null, // null signals a draw
        reason: 'Board full — it\'s a draw!',
      };
    }

    // Game is still in progress
    return { isOver: false };
  }
}
