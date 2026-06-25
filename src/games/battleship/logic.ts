// ============================================================
// Battleship — Pure Game Logic (no React / DOM deps)
// Shared between client and server.
// ============================================================

import type {
  CellState,
  PlayerBoard,
  PlacedShip,
  ShipId,
  Orientation,
  BattleshipState,
} from './types';
import { GRID_SIZE, TOTAL_CELLS, SHIPS } from './types';

// ── Coordinate helpers ──────────────────────────────────────

/** Convert (col, row) to flat index. */
export function toIndex(col: number, row: number): number {
  return row * GRID_SIZE + col;
}

/** Convert flat index to (col, row). */
export function toCoords(index: number): { col: number; row: number } {
  return { col: index % GRID_SIZE, row: Math.floor(index / GRID_SIZE) };
}

// ── Ship placement ──────────────────────────────────────────

/**
 * Compute the cell indices a ship would occupy given a start cell and orientation.
 * Returns null if the ship would go out of bounds.
 */
export function getShipCells(
  startCell: number,
  size: number,
  orientation: Orientation,
): number[] | null {
  const { col, row } = toCoords(startCell);
  const cells: number[] = [];

  for (let i = 0; i < size; i++) {
    const c = orientation === 'horizontal' ? col + i : col;
    const r = orientation === 'vertical' ? row + i : row;

    if (c < 0 || c >= GRID_SIZE || r < 0 || r >= GRID_SIZE) return null;
    cells.push(toIndex(c, r));
  }

  return cells;
}

/**
 * Validate a full set of ship placements.
 * Returns true if all ships are accounted for, in bounds, and don't overlap.
 */
export function validatePlacements(
  placements: { shipId: ShipId; startCell: number; orientation: Orientation }[],
): { valid: boolean; error?: string; ships?: PlacedShip[] } {
  // Must have exactly 5 ships
  if (placements.length !== SHIPS.length) {
    return { valid: false, error: `Expected ${SHIPS.length} ships, got ${placements.length}` };
  }

  const usedCells = new Set<number>();
  const usedShipIds = new Set<ShipId>();
  const result: PlacedShip[] = [];

  for (const placement of placements) {
    const shipDef = SHIPS.find((s) => s.id === placement.shipId);
    if (!shipDef) {
      return { valid: false, error: `Unknown ship: ${placement.shipId}` };
    }
    if (usedShipIds.has(placement.shipId)) {
      return { valid: false, error: `Duplicate ship: ${placement.shipId}` };
    }
    usedShipIds.add(placement.shipId);

    const cells = getShipCells(placement.startCell, shipDef.size, placement.orientation);
    if (!cells) {
      return { valid: false, error: `${shipDef.name} goes out of bounds` };
    }

    for (const cell of cells) {
      if (usedCells.has(cell)) {
        return { valid: false, error: `${shipDef.name} overlaps with another ship` };
      }
      usedCells.add(cell);
    }

    result.push({
      id: shipDef.id,
      size: shipDef.size,
      cells,
      sunk: false,
    });
  }

  return { valid: true, ships: result };
}

// ── Board helpers ───────────────────────────────────────────

/** Create an empty 10×10 board. */
export function createEmptyBoard(): PlayerBoard {
  return {
    cells: Array(TOTAL_CELLS).fill('empty') as CellState[],
    ships: [],
  };
}

/** Place validated ships onto a board, marking cells as 'ship'. */
export function applyShipsToBoard(board: PlayerBoard, ships: PlacedShip[]): PlayerBoard {
  const newCells = [...board.cells];
  for (const ship of ships) {
    for (const cell of ship.cells) {
      newCells[cell] = 'ship';
    }
  }
  return { cells: newCells, ships };
}

// ── Combat helpers ──────────────────────────────────────────

/**
 * Fire at a cell on the target board.
 * Returns the updated board, the result, and optionally the sunk ship ID.
 */
export function fireAtCell(
  board: PlayerBoard,
  cell: number,
): {
  board: PlayerBoard;
  result: 'hit' | 'miss' | 'sunk';
  sunkShipId?: ShipId;
} {
  const newCells = [...board.cells];
  const cellState = newCells[cell];

  if (cellState === 'ship') {
    newCells[cell] = 'hit';

    // Check if any ship was sunk
    const newShips = board.ships.map((ship) => {
      if (!ship.cells.includes(cell)) return ship;
      // Check if all cells of this ship are now hit
      const allHit = ship.cells.every((c) => (c === cell ? true : newCells[c] === 'hit'));
      return { ...ship, sunk: allHit };
    });

    const sunkShip = newShips.find((s) => s.sunk && !board.ships.find((os) => os.id === s.id && os.sunk));

    return {
      board: { cells: newCells, ships: newShips },
      result: sunkShip ? 'sunk' : 'hit',
      sunkShipId: sunkShip?.id,
    };
  }

  // Miss (empty cell)
  newCells[cell] = 'miss';
  return {
    board: { cells: newCells, ships: board.ships },
    result: 'miss',
  };
}

/**
 * Check if a fire action is valid.
 */
export function isValidFire(
  state: BattleshipState,
  cell: number,
  playerId: string,
): boolean {
  if (state.phase !== 'combat') return false;
  if (state.currentTurn !== playerId) return false;
  if (cell < 0 || cell >= TOTAL_CELLS || !Number.isInteger(cell)) return false;

  // Get opponent's board
  const opponentId = state.players[0] === playerId ? state.players[1] : state.players[0];
  const opponentBoard = state.boards[opponentId];
  if (!opponentBoard) return false;

  // Can't fire at already-hit or already-missed cells
  const cellState = opponentBoard.cells[cell];
  if (cellState === 'hit' || cellState === 'miss') return false;

  return true;
}

/**
 * Check if all of a player's ships have been sunk.
 */
export function allShipsSunk(board: PlayerBoard): boolean {
  return board.ships.length > 0 && board.ships.every((ship) => ship.sunk);
}

/**
 * Get the label for a row (A-J).
 */
export function getRowLabel(row: number): string {
  return String.fromCharCode(65 + row); // A=0, B=1, ...
}

/**
 * Get the label for a column (1-10).
 */
export function getColLabel(col: number): string {
  return String(col + 1);
}
