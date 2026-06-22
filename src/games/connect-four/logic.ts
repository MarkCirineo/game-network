// ============================================================
// Connect Four — Pure Game Logic (no React / DOM deps)
// Shared between client and server.
// ============================================================

import type { ConnectFourState, ConnectFourAction } from './types';
import { COLS, ROWS, BOARD_SIZE } from './types';

// ── Coordinate helpers ──────────────────────────────────────

/** Convert (col, row) to a flat board index. */
export function toIndex(col: number, row: number): number {
  return row * COLS + col;
}

/** Convert a flat board index to (col, row). */
export function toCoords(index: number): { col: number; row: number } {
  return { col: index % COLS, row: Math.floor(index / COLS) };
}

// ── Win detection ───────────────────────────────────────────

/**
 * All possible four-in-a-row lines on a 7×6 board.
 * Pre-computed once for performance.
 *
 * Directions checked: horizontal, vertical, diagonal ↘, diagonal ↗
 */
export const WINNING_LINES: readonly number[][] = (() => {
  const lines: number[][] = [];

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

/**
 * Check if someone has won.
 * Returns the winner's player ID and the winning line indices, or null.
 */
export function checkWinner(
  board: (string | null)[],
): { winnerId: string; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c, d] = line;
    if (
      board[a] !== null &&
      board[a] === board[b] &&
      board[b] === board[c] &&
      board[c] === board[d]
    ) {
      return { winnerId: board[a]!, line: [...line] };
    }
  }
  return null;
}

/**
 * A draw occurs when every cell is filled and nobody has won.
 */
export function isDraw(board: (string | null)[]): boolean {
  return board.every((cell) => cell !== null) && checkWinner(board) === null;
}

// ── Move helpers ────────────────────────────────────────────

/**
 * Find the lowest empty row in a column (gravity).
 * Returns the row index (0 = top, 5 = bottom), or -1 if the column is full.
 */
export function getLowestEmptyRow(board: (string | null)[], col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[toIndex(col, row)] === null) {
      return row;
    }
  }
  return -1; // Column is full
}

/**
 * Check if a column has any empty cells.
 */
export function isColumnPlayable(board: (string | null)[], col: number): boolean {
  return getLowestEmptyRow(board, col) >= 0;
}

/**
 * Validate whether a proposed move is legal.
 */
export function isValidMove(
  state: ConnectFourState,
  action: ConnectFourAction,
  playerId: string,
): boolean {
  // Must be the right action type
  if (action.type !== 'drop') return false;

  // Must be this player's turn
  if (state.currentTurn !== playerId) return false;

  // Column must be in range
  if (action.column < 0 || action.column >= COLS || !Number.isInteger(action.column)) return false;

  // Column must have space
  if (!isColumnPlayable(state.board, action.column)) return false;

  // Game must not already be over
  if (state.winningLine !== null) return false;
  if (isDraw(state.board)) return false;

  return true;
}
