// ============================================================
// ArcadeKit — Connect Four Engine
// Classic 7×6 grid game. Two players alternate dropping discs.
// First to connect 4 in a row (horizontal, vertical, or
// diagonal) wins; all 42 cells filled = draw.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const COLS = 7;
const ROWS = 6;
const BOARD_SIZE = COLS * ROWS; // 42

/** Convert (col, row) to a flat board index. */
function toIndex(col: number, row: number): number {
  return row * COLS + col;
}

// ------------------------------------------------------------
// State shape
// ------------------------------------------------------------

export interface ConnectFourState {
  /** 42-cell board, null = empty, otherwise player ID */
  board: (string | null)[];
  /** Player ID whose turn it is */
  currentTurn: string;
  /** Ordered player IDs: [0] = Red (goes first), [1] = Yellow */
  players: [string, string];
  /** Total discs dropped so far */
  moveCount: number;
  /** Indices of the winning four cells, or null */
  winningLine: number[] | null;
  /** Column and row of the most recent drop (for client animation) */
  lastDrop: { col: number; row: number } | null;
}

export interface ConnectFourAction {
  type: 'drop';
  /** Column index 0–6 */
  column: number;
}

// ------------------------------------------------------------
// Pre-compute all possible four-in-a-row lines (69 total)
// Directions: horizontal →, vertical ↓, diagonal ↘, diagonal ↗
// ------------------------------------------------------------

const WIN_LINES: readonly [number, number, number, number][] = (() => {
  const lines: [number, number, number, number][] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // Horizontal →
      if (col + 3 < COLS) {
        lines.push([
          toIndex(col, row),
          toIndex(col + 1, row),
          toIndex(col + 2, row),
          toIndex(col + 3, row),
        ]);
      }
      // Vertical ↓
      if (row + 3 < ROWS) {
        lines.push([
          toIndex(col, row),
          toIndex(col, row + 1),
          toIndex(col, row + 2),
          toIndex(col, row + 3),
        ]);
      }
      // Diagonal ↘
      if (col + 3 < COLS && row + 3 < ROWS) {
        lines.push([
          toIndex(col, row),
          toIndex(col + 1, row + 1),
          toIndex(col + 2, row + 2),
          toIndex(col + 3, row + 3),
        ]);
      }
      // Diagonal ↗
      if (col + 3 < COLS && row - 3 >= 0) {
        lines.push([
          toIndex(col, row),
          toIndex(col + 1, row - 1),
          toIndex(col + 2, row - 2),
          toIndex(col + 3, row - 3),
        ]);
      }
    }
  }

  return lines;
})();

// ------------------------------------------------------------
// Engine implementation
// ------------------------------------------------------------

export class ConnectFourEngine extends GameEngine {
  readonly name = 'Connect Four';
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  createInitialState(players: PlayerInfo[], _options?: Record<string, unknown>): ConnectFourState {
    return {
      board: Array(BOARD_SIZE).fill(null) as (string | null)[],
      currentTurn: players[0].id,
      players: [players[0].id, players[1].id],
      moveCount: 0,
      winningLine: null,
      lastDrop: null,
    };
  }

  validateAction(state: unknown, action: unknown, playerId: string): boolean {
    const s = state as ConnectFourState;
    const a = action as ConnectFourAction;

    // Must be this player's turn
    if (s.currentTurn !== playerId) return false;

    // Column must be a valid integer 0–6
    if (
      typeof a.column !== 'number' ||
      a.column < 0 ||
      a.column >= COLS ||
      !Number.isInteger(a.column)
    ) {
      return false;
    }

    // Column must have at least one empty cell
    if (this.getLowestEmptyRow(s.board, a.column) < 0) return false;

    // Game must not already be over
    if (s.winningLine !== null) return false;

    return true;
  }

  applyAction(state: unknown, action: unknown, playerId: string): ConnectFourState {
    const s = state as ConnectFourState;
    const a = action as ConnectFourAction;

    // Find the lowest empty row in this column (gravity)
    const targetRow = this.getLowestEmptyRow(s.board, a.column);

    // Clone board (immutable update)
    const newBoard = [...s.board];
    newBoard[toIndex(a.column, targetRow)] = playerId;

    // Switch turn to the other player
    const nextTurn = s.players[0] === playerId ? s.players[1] : s.players[0];

    // Check for a winning line after this move
    let winningLine: number[] | null = null;
    for (const [wa, wb, wc, wd] of WIN_LINES) {
      if (
        newBoard[wa] !== null &&
        newBoard[wa] === newBoard[wb] &&
        newBoard[wb] === newBoard[wc] &&
        newBoard[wc] === newBoard[wd]
      ) {
        winningLine = [wa, wb, wc, wd];
        break;
      }
    }

    return {
      board: newBoard,
      currentTurn: nextTurn,
      players: s.players,
      moveCount: s.moveCount + 1,
      winningLine,
      lastDrop: { col: a.column, row: targetRow },
    };
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as ConnectFourState;

    // Check each winning line
    for (const [a, b, c, d] of WIN_LINES) {
      if (
        s.board[a] !== null &&
        s.board[a] === s.board[b] &&
        s.board[b] === s.board[c] &&
        s.board[c] === s.board[d]
      ) {
        return {
          isOver: true,
          winnerId: s.board[a],
          reason: 'Four in a row!',
        };
      }
    }

    // Check for draw (all 42 cells filled, no winner)
    if (s.moveCount >= BOARD_SIZE) {
      return {
        isOver: true,
        winnerId: null, // null signals a draw
        reason: 'Board full — it\'s a draw!',
      };
    }

    // Game is still in progress
    return { isOver: false };
  }

  // ── Helper ──────────────────────────────────────────────────

  /**
   * Find the lowest empty row in a column (gravity).
   * Returns row index (0 = top, 5 = bottom), or -1 if full.
   */
  private getLowestEmptyRow(board: (string | null)[], col: number): number {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[toIndex(col, row)] === null) {
        return row;
      }
    }
    return -1;
  }
}
