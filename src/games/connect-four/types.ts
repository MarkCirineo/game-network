// ============================================================
// Connect Four — Game-Specific Types
// ============================================================

/**
 * Each cell is either a player ID string or null (empty).
 * Board is a 7-column × 6-row grid stored in row-major order:
 *
 *   Row 0 (top):     0  |  1  |  2  |  3  |  4  |  5  |  6
 *   Row 1:           7  |  8  |  9  | 10  | 11  | 12  | 13
 *   Row 2:          14  | 15  | 16  | 17  | 18  | 19  | 20
 *   Row 3:          21  | 22  | 23  | 24  | 25  | 26  | 27
 *   Row 4:          28  | 29  | 30  | 31  | 32  | 33  | 34
 *   Row 5 (bottom): 35  | 36  | 37  | 38  | 39  | 40  | 41
 *
 * Total: 42 cells. Columns 0–6, Rows 0–5.
 */

export const COLS = 7;
export const ROWS = 6;
export const BOARD_SIZE = COLS * ROWS; // 42

export interface ConnectFourState {
  /** 42-cell board — player ID or null (empty) */
  board: (string | null)[];
  /** Player ID whose turn it is */
  currentTurn: string;
  /** Ordered player IDs: index 0 = Red, index 1 = Yellow */
  players: [string, string];
  /** Total moves (discs dropped) so far */
  moveCount: number;
  /** Indices of the winning four cells, or null if no winner yet */
  winningLine: number[] | null;
  /** Column and row of the most recent drop, for animation */
  lastDrop: { col: number; row: number } | null;
}

export interface ConnectFourAction {
  type: 'drop';
  /** Column index (0–6) to drop the disc into */
  column: number;
}
