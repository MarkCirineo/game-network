// ============================================================
// Battleship — Game-Specific Types
// ============================================================

/**
 * 10×10 grid stored as a flat array of 100 cells (row-major).
 *
 *   Col:  0   1   2   3   4   5   6   7   8   9
 * Row 0:  0   1   2   3   4   5   6   7   8   9
 * Row 1: 10  11  12  13  14  15  16  17  18  19
 * ...
 * Row 9: 90  91  92  93  94  95  96  97  98  99
 */

export const GRID_SIZE = 10;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE; // 100

// ── Ship definitions ────────────────────────────────────────

export type ShipId = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export type Orientation = 'horizontal' | 'vertical';

export interface ShipDef {
  id: ShipId;
  name: string;
  size: number;
}

/** The 5 standard Battleship ships. */
export const SHIPS: readonly ShipDef[] = [
  { id: 'carrier', name: 'Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'cruiser', name: 'Cruiser', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 2 },
] as const;

export const TOTAL_SHIP_CELLS = SHIPS.reduce((sum, s) => sum + s.size, 0); // 17

// ── Cell state ──────────────────────────────────────────────

/**
 * Each cell on a player's board can be in one of these states.
 * - 'empty'  — water, no ship
 * - 'ship'   — ship segment (hidden from opponent)
 * - 'hit'    — ship segment that was hit
 * - 'miss'   — water that was fired at
 */
export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

// ── Ship placement (in state) ───────────────────────────────

export interface PlacedShip {
  id: ShipId;
  /** Size of the ship */
  size: number;
  /** Flat board indices this ship occupies */
  cells: number[];
  /** Whether all cells have been hit */
  sunk: boolean;
}

// ── Player board ────────────────────────────────────────────

export interface PlayerBoard {
  /** 100-cell grid */
  cells: CellState[];
  /** Ships placed on this board */
  ships: PlacedShip[];
}

// ── Game state ──────────────────────────────────────────────

export interface BattleshipState {
  /** Current game phase */
  phase: 'setup' | 'combat' | 'finished';
  /** Each player's board, keyed by player ID */
  boards: Record<string, PlayerBoard>;
  /** Player ID whose turn it is (only relevant in combat phase) */
  currentTurn: string;
  /** Ordered player IDs */
  players: [string, string];
  /** Whether each player has finished placing ships */
  shipsPlaced: Record<string, boolean>;
  /** Info about the last shot fired (for animation/feedback) */
  lastShot: {
    attackerId: string;
    cell: number;
    result: 'hit' | 'miss' | 'sunk';
    sunkShipId?: ShipId;
  } | null;
  /** Total shots fired (for footer display) */
  shotCount: number;
}

// ── Actions ─────────────────────────────────────────────────

export interface PlaceShipsAction {
  type: 'place_ships';
  /** Ship placements — start cell + orientation for each ship */
  placements: {
    shipId: ShipId;
    startCell: number;
    orientation: Orientation;
  }[];
}

export interface FireAction {
  type: 'fire';
  /** Target cell on opponent's board (0–99) */
  cell: number;
}

export type BattleshipAction = PlaceShipsAction | FireAction;
