// ============================================================
// Tic-Tac-Toe — Game-Specific Types
// ============================================================

/**
 * Each cell is either a player ID string or null (empty).
 * Board indices map to a 3×3 grid:
 *   0 | 1 | 2
 *   ---------
 *   3 | 4 | 5
 *   ---------
 *   6 | 7 | 8
 */
export interface TicTacToeState {
  /** 9-cell board — player ID or null */
  board: (string | null)[];
  /** Player ID whose turn it is */
  currentTurn: string;
  /** Ordered player IDs: index 0 = X, index 1 = O */
  players: [string, string];
  /** Total moves made so far */
  moveCount: number;
  /** Indices of the winning three cells, or null if no winner yet */
  winningLine: number[] | null;
}

export interface TicTacToeAction {
  type: 'place';
  /** Board index (0-8) where the player wants to place their mark */
  cellIndex: number;
}
