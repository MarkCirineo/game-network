// ============================================================
// Tic-Tac-Toe — Pure Game Logic (no React / DOM deps)
// ============================================================

import type { TicTacToeState, TicTacToeAction } from './types';

// All eight possible winning lines (row, col, diagonal indices)
export const WINNING_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
] as const;

/**
 * Check if someone has won.
 * Returns the winner's player ID and the winning line indices, or null.
 */
export function checkWinner(
  board: (string | null)[],
): { winnerId: string; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
      return { winnerId: board[a]!, line };
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

/**
 * Validate whether a proposed move is legal.
 */
export function isValidMove(
  state: TicTacToeState,
  action: TicTacToeAction,
  playerId: string,
): boolean {
  // Must be the right action type
  if (action.type !== 'place') return false;

  // Must be this player's turn
  if (state.currentTurn !== playerId) return false;

  // Cell index must be in range
  if (action.cellIndex < 0 || action.cellIndex > 8) return false;

  // Cell must be empty
  if (state.board[action.cellIndex] !== null) return false;

  // Game must not already be over
  if (state.winningLine !== null) return false;
  if (isDraw(state.board)) return false;

  return true;
}
