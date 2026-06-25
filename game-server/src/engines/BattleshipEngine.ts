// ============================================================
// ArcadeKit — Battleship Engine
// Two-phase game: ship placement (setup) then firing (combat).
// Uses getPlayerView() to hide opponent ship positions.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

type ShipId = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';
type Orientation = 'horizontal' | 'vertical';
type CellState = 'empty' | 'ship' | 'hit' | 'miss';

interface ShipDef {
  id: ShipId;
  size: number;
}

const SHIPS: readonly ShipDef[] = [
  { id: 'carrier', size: 5 },
  { id: 'battleship', size: 4 },
  { id: 'cruiser', size: 3 },
  { id: 'submarine', size: 3 },
  { id: 'destroyer', size: 2 },
];

// ------------------------------------------------------------
// State shape
// ------------------------------------------------------------

interface PlacedShip {
  id: ShipId;
  size: number;
  cells: number[];
  sunk: boolean;
}

interface PlayerBoard {
  cells: CellState[];
  ships: PlacedShip[];
}

export interface BattleshipState {
  phase: 'setup' | 'combat' | 'finished';
  boards: Record<string, PlayerBoard>;
  currentTurn: string;
  players: [string, string];
  shipsPlaced: Record<string, boolean>;
  lastShot: {
    attackerId: string;
    cell: number;
    result: 'hit' | 'miss' | 'sunk';
    sunkShipId?: ShipId;
  } | null;
  shotCount: number;
  /** Player names stored for use in game status messages */
  playerNames: Record<string, string>;
}

interface PlaceShipsAction {
  type: 'place_ships';
  placements: {
    shipId: ShipId;
    startCell: number;
    orientation: Orientation;
  }[];
}

interface FireAction {
  type: 'fire';
  cell: number;
}

type BattleshipAction = PlaceShipsAction | FireAction;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function toCoords(index: number): { col: number; row: number } {
  return { col: index % GRID_SIZE, row: Math.floor(index / GRID_SIZE) };
}

function toIndex(col: number, row: number): number {
  return row * GRID_SIZE + col;
}

function getShipCells(startCell: number, size: number, orientation: Orientation): number[] | null {
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

function createEmptyBoard(): PlayerBoard {
  return {
    cells: Array(TOTAL_CELLS).fill('empty') as CellState[],
    ships: [],
  };
}

// ------------------------------------------------------------
// Engine implementation
// ------------------------------------------------------------

export class BattleshipEngine extends GameEngine {
  readonly name = 'Battleship';
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  createInitialState(players: PlayerInfo[], _options?: Record<string, unknown>): BattleshipState {
    const boards: Record<string, PlayerBoard> = {};
    const shipsPlaced: Record<string, boolean> = {};

    for (const player of players) {
      boards[player.id] = createEmptyBoard();
      shipsPlaced[player.id] = false;
    }

    const playerNames: Record<string, string> = {};
    for (const player of players) {
      playerNames[player.id] = player.name;
    }

    return {
      phase: 'setup',
      boards,
      currentTurn: players[0].id,
      players: [players[0].id, players[1].id],
      shipsPlaced,
      lastShot: null,
      shotCount: 0,
      playerNames,
    };
  }

  validateAction(state: unknown, action: unknown, playerId: string): boolean {
    const s = state as BattleshipState;
    const a = action as BattleshipAction;

    if (a.type === 'place_ships') {
      // Must be in setup phase
      if (s.phase !== 'setup') return false;
      // Must not have already placed ships
      if (s.shipsPlaced[playerId]) return false;
      // Player must be a participant
      if (!s.players.includes(playerId)) return false;

      return this.validatePlacements(a.placements);
    }

    if (a.type === 'fire') {
      if (s.phase !== 'combat') return false;
      if (s.currentTurn !== playerId) return false;
      if (typeof a.cell !== 'number' || a.cell < 0 || a.cell >= TOTAL_CELLS || !Number.isInteger(a.cell)) {
        return false;
      }

      // Get opponent board
      const opponentId = s.players[0] === playerId ? s.players[1] : s.players[0];
      const opponentBoard = s.boards[opponentId];
      const cellState = opponentBoard.cells[a.cell];

      // Can't fire at already-targeted cells
      if (cellState === 'hit' || cellState === 'miss') return false;

      return true;
    }

    return false;
  }

  applyAction(state: unknown, action: unknown, playerId: string): BattleshipState {
    const s = state as BattleshipState;
    const a = action as BattleshipAction;

    if (a.type === 'place_ships') {
      return this.applyPlaceShips(s, a, playerId);
    }

    if (a.type === 'fire') {
      return this.applyFire(s, a, playerId);
    }

    return s;
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as BattleshipState;

    if (s.phase !== 'combat' && s.phase !== 'finished') {
      return { isOver: false };
    }

    // Check if all of either player's ships have been sunk
    for (const pid of s.players) {
      const board = s.boards[pid];
      if (board.ships.length > 0 && board.ships.every((ship) => ship.sunk)) {
        const winnerId = s.players[0] === pid ? s.players[1] : s.players[0];
        const loserName = s.playerNames[pid] ?? 'Unknown';
        return {
          isOver: true,
          winnerId,
          reason: `${loserName}'s fleet has been destroyed!`,
        };
      }
    }

    return { isOver: false };
  }

  /**
   * CRITICAL: Hide opponent's ship positions during combat.
   * Each player sees:
   * - Their own board in full (ships + hits + misses)
   * - Opponent's board with ships hidden (only hits + misses visible)
   */
  getPlayerView(state: unknown, playerId: string): unknown {
    const s = state as BattleshipState;

    // During setup: each player only sees their own board
    // During combat/finished: each player sees their own board fully,
    // and the opponent's board with ships hidden (only hit/miss visible)

    const sanitizedBoards: Record<string, PlayerBoard> = {};

    for (const pid of s.players) {
      if (pid === playerId) {
        // Own board — show everything
        sanitizedBoards[pid] = s.boards[pid];
      } else {
        // Opponent board — hide unhit ships
        const board = s.boards[pid];
        const sanitizedCells = board.cells.map((cell) =>
          cell === 'ship' ? 'empty' : cell,
        ) as CellState[];

        // Only expose sunk ship count (not identity) — attacker
        // shouldn't know which specific ship they sank
        const sanitizedShips = board.ships
          .filter((ship) => ship.sunk)
          .map((ship) => ({ ...ship, id: 'unknown' as ShipId }));

        sanitizedBoards[pid] = {
          cells: sanitizedCells,
          ships: sanitizedShips,
        };
      }
    }

    // Strip sunkShipId from lastShot so attacker doesn't know which ship
    const sanitizedLastShot = s.lastShot
      ? { ...s.lastShot, sunkShipId: undefined }
      : null;

    return {
      ...s,
      boards: sanitizedBoards,
      lastShot: sanitizedLastShot,
    };
  }

  // ── Private helpers ─────────────────────────────────────────

  private validatePlacements(
    placements: { shipId: ShipId; startCell: number; orientation: Orientation }[],
  ): boolean {
    if (placements.length !== SHIPS.length) return false;

    const usedCells = new Set<number>();
    const usedShipIds = new Set<ShipId>();

    for (const placement of placements) {
      const shipDef = SHIPS.find((sd) => sd.id === placement.shipId);
      if (!shipDef) return false;
      if (usedShipIds.has(placement.shipId)) return false;
      usedShipIds.add(placement.shipId);

      const cells = getShipCells(placement.startCell, shipDef.size, placement.orientation);
      if (!cells) return false;

      for (const cell of cells) {
        if (usedCells.has(cell)) return false;
        usedCells.add(cell);
      }
    }

    return true;
  }

  private applyPlaceShips(
    s: BattleshipState,
    a: PlaceShipsAction,
    playerId: string,
  ): BattleshipState {
    // Build ship objects
    const ships: PlacedShip[] = a.placements.map((p) => {
      const shipDef = SHIPS.find((sd) => sd.id === p.shipId)!;
      const cells = getShipCells(p.startCell, shipDef.size, p.orientation)!;
      return { id: shipDef.id, size: shipDef.size, cells, sunk: false };
    });

    // Apply to board
    const newCells = [...s.boards[playerId].cells];
    for (const ship of ships) {
      for (const cell of ship.cells) {
        newCells[cell] = 'ship';
      }
    }

    const newBoards = {
      ...s.boards,
      [playerId]: { cells: newCells, ships },
    };

    const newShipsPlaced = { ...s.shipsPlaced, [playerId]: true };

    // Check if both players have placed — transition to combat
    const bothPlaced = s.players.every((pid) => newShipsPlaced[pid]);

    return {
      ...s,
      boards: newBoards,
      shipsPlaced: newShipsPlaced,
      phase: bothPlaced ? 'combat' : 'setup',
      // Randomize who goes first in combat
      currentTurn: bothPlaced
        ? s.players[Math.random() < 0.5 ? 0 : 1]
        : s.currentTurn,
    };
  }

  private applyFire(
    s: BattleshipState,
    a: FireAction,
    playerId: string,
  ): BattleshipState {
    const opponentId = s.players[0] === playerId ? s.players[1] : s.players[0];
    const opponentBoard = s.boards[opponentId];

    const newCells = [...opponentBoard.cells];
    const cellState = newCells[a.cell];

    let result: 'hit' | 'miss' | 'sunk' = 'miss';
    let sunkShipId: ShipId | undefined;
    let newShips = opponentBoard.ships;

    if (cellState === 'ship') {
      newCells[a.cell] = 'hit';
      result = 'hit';

      // Check for sunk ships
      newShips = opponentBoard.ships.map((ship) => {
        if (!ship.cells.includes(a.cell)) return ship;
        const allHit = ship.cells.every((c) => (c === a.cell ? true : newCells[c] === 'hit'));
        if (allHit && !ship.sunk) {
          result = 'sunk';
          sunkShipId = ship.id;
          return { ...ship, sunk: true };
        }
        return ship;
      });
    } else {
      newCells[a.cell] = 'miss';
    }

    const newBoards = {
      ...s.boards,
      [opponentId]: { cells: newCells, ships: newShips },
    };

    // Check if game is over (all opponent ships sunk)
    const allSunk = newShips.every((ship) => ship.sunk);

    // Only switch turns on a miss — hits/sinks keep your turn (classic rules)
    const nextTurn = result === 'miss' ? opponentId : playerId;

    return {
      ...s,
      boards: newBoards,
      currentTurn: nextTurn,
      phase: allSunk ? 'finished' : 'combat',
      lastShot: {
        attackerId: playerId,
        cell: a.cell,
        result,
        sunkShipId,
      },
      shotCount: s.shotCount + 1,
    };
  }
}
