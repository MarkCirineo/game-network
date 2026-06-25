'use client';

// ============================================================
// Battleship — Game UI Component
// Two-phase: Setup (place ships) → Combat (fire at opponent)
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '@/games/types';
import type {
  BattleshipState,
  BattleshipAction,
  ShipId,
  Orientation,
  CellState,
  PlacedShip,
} from './types';
import { GRID_SIZE, SHIPS, TOTAL_CELLS } from './types';
import { getShipCells, toCoords, getRowLabel, getColLabel, validatePlacements } from './logic';

// ── Grid Cell Component ─────────────────────────────────────

interface GridCellProps {
  index: number;
  state: CellState;
  isOwnBoard: boolean;
  canFire: boolean;
  isLastShot: boolean;
  isHovered: boolean;
  isSunkShipCell: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function GridCell({
  state,
  isOwnBoard,
  canFire,
  isLastShot,
  isHovered,
  isSunkShipCell,
  onClick,
  onHover,
  onLeave,
}: GridCellProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      disabled={!canFire}
      className={cn(
        'relative flex items-center justify-center',
        'h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11',
        'rounded-sm border border-white/5 transition-all duration-150',
        // Base water
        state === 'empty' && !isHovered && 'bg-sky-950/80',
        state === 'empty' && isHovered && canFire && 'bg-sky-800/80 border-sky-400/40',
        // Ship (own board only — opponent ships are hidden)
        state === 'ship' && isOwnBoard && 'bg-slate-500/60 border-slate-400/30',
        state === 'ship' && !isOwnBoard && 'bg-sky-950/80', // hidden, looks like water
        // Hit
        state === 'hit' && !isSunkShipCell && 'bg-red-600/50 border-red-500/40',
        state === 'hit' && isSunkShipCell && 'bg-red-700/60 border-red-400/50',
        // Miss
        state === 'miss' && 'bg-sky-900/60 border-sky-700/30',
        // Clickable
        canFire ? 'cursor-crosshair' : 'cursor-default',
      )}
      whileTap={canFire ? { scale: 0.85 } : undefined}
    >
      {/* Hit marker */}
      <AnimatePresence>
        {state === 'hit' && (
          <motion.div
            key="hit"
            initial={isLastShot ? { scale: 0, rotate: -90 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-[10px] sm:text-xs"
          >
            🔥
          </motion.div>
        )}
      </AnimatePresence>

      {/* Miss marker */}
      <AnimatePresence>
        {state === 'miss' && (
          <motion.div
            key="miss"
            initial={isLastShot ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="h-1.5 w-1.5 rounded-full bg-sky-400/40 sm:h-2 sm:w-2"
          />
        )}
      </AnimatePresence>

      {/* Ship segment on own board */}
      {state === 'ship' && isOwnBoard && (
        <div className="h-4 w-4 rounded-sm bg-slate-400/30 sm:h-5 sm:w-5" />
      )}

      {/* Crosshair on hover */}
      {state === 'empty' && isHovered && canFire && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-1.5 w-1.5 rounded-full bg-red-400/60 ring-2 ring-red-400/30 sm:h-2 sm:w-2"
        />
      )}
    </motion.button>
  );
}

// ── Grid Board Component ────────────────────────────────────

interface BoardGridProps {
  cells: CellState[];
  ships: PlacedShip[];
  isOwnBoard: boolean;
  canFire: boolean;
  lastShotCell: number | null;
  label: string;
  hoveredCell: number | null;
  onCellClick: (cell: number) => void;
  onCellHover: (cell: number | null) => void;
}

function BoardGrid({
  cells,
  ships,
  isOwnBoard,
  canFire,
  lastShotCell,
  label,
  hoveredCell,
  onCellClick,
  onCellHover,
}: BoardGridProps) {
  // Pre-compute sunk ship cells for styling
  const sunkCells = useMemo(() => {
    const set = new Set<number>();
    for (const ship of ships) {
      if (ship.sunk) {
        for (const cell of ship.cells) set.add(cell);
      }
    }
    return set;
  }, [ships]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="rounded-lg border border-sky-800/40 bg-sky-950/50 p-1 sm:p-1.5">
        {/* Column labels */}
        <div className="flex gap-0">
          <div className="h-5 w-9 sm:h-6 sm:w-10 md:w-11" /> {/* spacer for row labels */}
          {Array.from({ length: GRID_SIZE }, (_, col) => (
            <div
              key={col}
              className="flex h-5 w-9 items-center justify-center text-[10px] text-muted-foreground sm:h-6 sm:w-10 sm:text-xs md:w-11"
            >
              {getColLabel(col)}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {Array.from({ length: GRID_SIZE }, (_, row) => (
          <div key={row} className="flex gap-0">
            {/* Row label */}
            <div className="flex h-9 w-9 items-center justify-center text-[10px] text-muted-foreground sm:h-10 sm:w-10 sm:text-xs md:h-11 md:w-11">
              {getRowLabel(row)}
            </div>
            {Array.from({ length: GRID_SIZE }, (_, col) => {
              const idx = row * GRID_SIZE + col;
              return (
                <GridCell
                  key={idx}
                  index={idx}
                  state={cells[idx]}
                  isOwnBoard={isOwnBoard}
                  canFire={canFire && cells[idx] !== 'hit' && cells[idx] !== 'miss' && (isOwnBoard ? false : true)}
                  isLastShot={lastShotCell === idx}
                  isHovered={hoveredCell === idx}
                  isSunkShipCell={sunkCells.has(idx)}
                  onClick={() => onCellClick(idx)}
                  onHover={() => onCellHover(idx)}
                  onLeave={() => onCellHover(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Sunk ships list */}
      {isOwnBoard && ships.filter((s) => s.sunk).length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {ships
            .filter((s) => s.sunk)
            .map((ship) => (
              <span
                key={ship.id}
                className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400 line-through"
              >
                {SHIPS.find((sd) => sd.id === ship.id)?.name ?? ship.id}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Rotate Button with Keyboard Shortcut ────────────────────

interface RotateButtonProps {
  orientation: Orientation;
  onToggle: () => void;
}

function RotateButton({ orientation, onToggle }: RotateButtonProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        // Blur the focused grid cell so it doesn't show a stale focus ring
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onToggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggle]);

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/10 transition-colors"
    >
      <span>↻ {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground/70">R</span>
    </button>
  );
}

// ── Setup Phase: Ship Placement ─────────────────────────────

interface SetupPhaseProps {
  myPlayerId: string;
  isSpectator: boolean;
  hasPlaced: boolean;
  opponentHasPlaced: boolean;
  sendAction: (action: BattleshipAction) => void;
  getPlayerName: (id: string) => string;
  opponentId: string;
}

function SetupPhase({
  isSpectator,
  hasPlaced,
  opponentHasPlaced,
  sendAction,
  getPlayerName,
  opponentId,
}: SetupPhaseProps) {
  const [placements, setPlacements] = useState<
    Record<ShipId, { startCell: number; orientation: Orientation } | null>
  >({
    carrier: null,
    battleship: null,
    cruiser: null,
    submarine: null,
    destroyer: null,
  });

  const [currentShipIdx, setCurrentShipIdx] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentShip = currentShipIdx < SHIPS.length ? SHIPS[currentShipIdx] : null;
  const allPlaced = SHIPS.every((s) => placements[s.id] !== null);

  // Compute preview cells for the ship being placed
  const previewCells = useMemo(() => {
    if (!currentShip || hoveredCell === null) return new Set<number>();
    const cells = getShipCells(hoveredCell, currentShip.size, orientation);
    return new Set(cells ?? []);
  }, [currentShip, hoveredCell, orientation]);

  // Check if preview placement is valid (no overlap, in bounds)
  const isPreviewValid = useMemo(() => {
    if (!currentShip || hoveredCell === null) return false;
    const cells = getShipCells(hoveredCell, currentShip.size, orientation);
    if (!cells) return false;
    // Check overlap with already-placed ships
    for (const ship of SHIPS) {
      const p = placements[ship.id];
      if (!p) continue;
      const existingCells = getShipCells(p.startCell, ship.size, p.orientation) ?? [];
      if (cells.some((c) => existingCells.includes(c))) return false;
    }
    return true;
  }, [currentShip, hoveredCell, orientation, placements]);

  // Compute all cells occupied by already-placed ships
  const placedCells = useMemo(() => {
    const map = new Map<number, ShipId>();
    for (const ship of SHIPS) {
      const p = placements[ship.id];
      if (!p) continue;
      const cells = getShipCells(p.startCell, ship.size, p.orientation) ?? [];
      for (const cell of cells) map.set(cell, ship.id);
    }
    return map;
  }, [placements]);

  const handleCellClick = useCallback(
    (cell: number) => {
      if (!currentShip || hasPlaced || isSpectator) return;
      const cells = getShipCells(cell, currentShip.size, orientation);
      if (!cells) {
        setError('Ship goes out of bounds!');
        return;
      }
      // Check overlap
      for (const c of cells) {
        if (placedCells.has(c)) {
          setError('Ships cannot overlap!');
          return;
        }
      }
      setError(null);
      setPlacements((prev) => ({
        ...prev,
        [currentShip.id]: { startCell: cell, orientation },
      }));
      setCurrentShipIdx((prev) => prev + 1);
    },
    [currentShip, orientation, hasPlaced, isSpectator, placedCells],
  );

  const handleUndo = useCallback(() => {
    if (currentShipIdx <= 0) return;
    const prevIdx = currentShipIdx - 1;
    const prevShip = SHIPS[prevIdx];
    setPlacements((prev) => ({ ...prev, [prevShip.id]: null }));
    setCurrentShipIdx(prevIdx);
    setError(null);
  }, [currentShipIdx]);

  const handleConfirm = useCallback(() => {
    if (!allPlaced || hasPlaced) return;
    const placementList = SHIPS.map((ship) => {
      const p = placements[ship.id]!;
      return { shipId: ship.id, startCell: p.startCell, orientation: p.orientation };
    });
    const validation = validatePlacements(placementList);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid placement');
      return;
    }
    sendAction({ type: 'place_ships', placements: placementList });
  }, [allPlaced, hasPlaced, placements, sendAction]);

  if (isSpectator) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-10">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl"
        >
          🚢
        </motion.div>
        <p className="text-sm text-muted-foreground">Players are placing their ships…</p>
      </div>
    );
  }

  if (hasPlaced) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-10">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
        <p className="text-sm font-medium">Ships placed! Waiting for {getPlayerName(opponentId)}…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      <div className="text-center">
        <h2 className="text-lg font-bold">Place Your Ships</h2>
        {currentShip ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Placing: <span className="font-semibold text-sky-400">{SHIPS.find(s => s.id === currentShip.id)?.name}</span>{' '}
            ({currentShip.size} cells)
          </p>
        ) : (
          <p className="mt-1 text-sm text-emerald-400">All ships placed! Confirm when ready.</p>
        )}
      </div>

      {/* Orientation toggle + R hotkey */}
      {currentShip && (
        <div className="flex items-center gap-2">
          <RotateButton orientation={orientation} onToggle={() => setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))} />
        </div>
      )}

      {/* Placement grid */}
      <div className="rounded-lg border border-sky-800/40 bg-sky-950/50 p-1 sm:p-1.5">
        {/* Column labels */}
        <div className="flex gap-0">
          <div className="h-5 w-9 sm:h-6 sm:w-10 md:w-11" />
          {Array.from({ length: GRID_SIZE }, (_, col) => (
            <div
              key={col}
              className="flex h-5 w-9 items-center justify-center text-[10px] text-muted-foreground sm:h-6 sm:w-10 sm:text-xs md:w-11"
            >
              {getColLabel(col)}
            </div>
          ))}
        </div>

        {Array.from({ length: GRID_SIZE }, (_, row) => (
          <div key={row} className="flex gap-0">
            <div className="flex h-9 w-9 items-center justify-center text-[10px] text-muted-foreground sm:h-10 sm:w-10 sm:text-xs md:h-11 md:w-11">
              {getRowLabel(row)}
            </div>
            {Array.from({ length: GRID_SIZE }, (_, col) => {
              const idx = row * GRID_SIZE + col;
              const isPlaced = placedCells.has(idx);
              const isPreview = previewCells.has(idx);
              const isHov = hoveredCell === idx;

              return (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => handleCellClick(idx)}
                  onMouseEnter={() => currentShip && setHoveredCell(idx)}
                  onMouseLeave={() => setHoveredCell(null)}
                  disabled={!currentShip}
                  className={cn(
                    'flex items-center justify-center',
                    'h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11',
                    'rounded-sm border border-white/5 transition-all duration-100',
                    // Water
                    !isPlaced && !isPreview && 'bg-sky-950/80',
                    // Placed ship
                    isPlaced && 'bg-slate-500/60 border-slate-400/30',
                    // Preview (valid)
                    isPreview && isPreviewValid && !isPlaced && 'bg-emerald-500/30 border-emerald-400/40',
                    // Preview (invalid)
                    isPreview && !isPreviewValid && !isPlaced && 'bg-red-500/30 border-red-400/40',
                    // Cursor
                    currentShip ? 'cursor-pointer' : 'cursor-default',
                  )}
                  whileTap={currentShip ? { scale: 0.85 } : undefined}
                >
                  {isPlaced && (
                    <div className="h-4 w-4 rounded-sm bg-slate-400/30 sm:h-5 sm:w-5" />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Ship list */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {SHIPS.map((ship, i) => {
          const placed = placements[ship.id] !== null;
          const isCurrent = i === currentShipIdx;
          return (
            <span
              key={ship.id}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                placed && 'bg-emerald-500/15 text-emerald-400',
                isCurrent && !placed && 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30',
                !placed && !isCurrent && 'bg-white/5 text-muted-foreground',
              )}
            >
              {ship.name} ({ship.size})
            </span>
          );
        })}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-2">
        {currentShipIdx > 0 && (
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 transition-colors"
          >
            ↩ Undo
          </button>
        )}
        {allPlaced && (
          <motion.button
            type="button"
            onClick={handleConfirm}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-lg bg-sky-600 px-6 py-2 text-sm font-bold text-white hover:bg-sky-500 transition-colors"
          >
            Confirm Placement
          </motion.button>
        )}
      </div>

      {opponentHasPlaced && (
        <p className="text-[11px] text-muted-foreground">
          {getPlayerName('')} is ready — place your ships to begin!
        </p>
      )}
    </div>
  );
}

// ── Main Game Component ─────────────────────────────────────

export default function BattleshipGame({
  gameState,
  myPlayerId,
  isMyTurn,
  isSpectator,
  players,
  sendAction,
  phase,
}: GameComponentProps<BattleshipState, BattleshipAction>) {
  const {
    phase: gamePhase,
    boards,
    currentTurn,
    players: gamePlayers,
    shipsPlaced,
    lastShot,
    shotCount,
  } = gameState;

  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const opponentId = gamePlayers[0] === myPlayerId ? gamePlayers[1] : gamePlayers[0];
  const myBoard = boards[myPlayerId];
  const opponentBoard = boards[opponentId];
  const isGameOver = phase === 'finished' || gamePhase === 'finished';

  const getPlayerName = useCallback(
    (id: string) => players.find((p) => p.id === id)?.name ?? 'Unknown',
    [players],
  );

  const handleFire = useCallback(
    (cell: number) => {
      if (isSpectator || !isMyTurn || isGameOver || gamePhase !== 'combat') return;
      if (!opponentBoard) return;
      const cellState = opponentBoard.cells[cell];
      if (cellState === 'hit' || cellState === 'miss') return;
      sendAction({ type: 'fire', cell });
      setHoveredCell(null);
    },
    [isSpectator, isMyTurn, isGameOver, gamePhase, opponentBoard, sendAction],
  );

  // Status message
  const statusMessage = useMemo(() => {
    if (isGameOver) {
      // Check OWN board first — it always shows all 5 ships (reliable).
      // The opponent's board is filtered by getPlayerView, so we can't
      // trust ships.every(s => s.sunk) on it.
      const myBoardData = boards[myPlayerId];
      if (myBoardData?.ships?.length === SHIPS.length && myBoardData.ships.every((s) => s.sunk)) {
        return `💀 ${getPlayerName(opponentId)} wins! Your fleet was sunk!`;
      }
      return '🎉 You won! All enemy ships sunk!';
    }
    if (gamePhase === 'setup') {
      return 'Place your ships on the grid';
    }
    if (isSpectator) {
      return `${getPlayerName(currentTurn)}'s turn to fire`;
    }
    if (lastShot && lastShot.result === 'sunk' && lastShot.attackerId !== myPlayerId) {
      // Only tell the DEFENDER their ship was sunk — attacker gets no info
      return `💥 ${getPlayerName(lastShot.attackerId)} sunk one of your ships!`;
    }
    return isMyTurn ? '🎯 Your turn — fire at the enemy grid!' : `Waiting for ${getPlayerName(currentTurn)}…`;
  }, [isGameOver, gamePhase, isSpectator, isMyTurn, currentTurn, lastShot, myPlayerId, opponentId, boards, getPlayerName]);

  // ── Setup phase ─────────────────────────────────────────────
  if (gamePhase === 'setup') {
    return (
      <SetupPhase
        myPlayerId={myPlayerId}
        isSpectator={isSpectator}
        hasPlaced={shipsPlaced[myPlayerId] ?? false}
        opponentHasPlaced={shipsPlaced[opponentId] ?? false}
        sendAction={sendAction}
        getPlayerName={getPlayerName}
        opponentId={opponentId}
      />
    );
  }

  // ── Combat / Finished phase ─────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4 px-2 py-6 sm:gap-6 sm:px-4">
      {/* Status bar */}
      <motion.div
        key={statusMessage}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-full px-4 py-1.5 text-sm font-semibold',
          isGameOver
            ? 'bg-sky-500/15 text-sky-400'
            : isMyTurn
              ? 'bg-sky-500/15 text-sky-400'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {statusMessage}
      </motion.div>

      {/* Boards side by side (stack on mobile) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {isSpectator ? (
          <>
            {/* Spectator: show both players' boards with names */}
            {gamePlayers.map((pid) => {
              const board = boards[pid];
              if (!board) return null;
              return (
                <BoardGrid
                  key={pid}
                  cells={board.cells}
                  ships={board.ships}
                  isOwnBoard={false}
                  canFire={false}
                  lastShotCell={lastShot && lastShot.attackerId !== pid ? lastShot.cell : null}
                  label={`${getPlayerName(pid)}'s Waters`}
                  hoveredCell={null}
                  onCellClick={() => {}}
                  onCellHover={() => {}}
                />
              );
            })}
          </>
        ) : (
          <>
            {/* Player: opponent board (where I fire) + my board */}
            {opponentBoard && (
              <BoardGrid
                cells={opponentBoard.cells}
                ships={opponentBoard.ships}
                isOwnBoard={false}
                canFire={!isGameOver && isMyTurn && gamePhase === 'combat'}
                lastShotCell={lastShot?.attackerId === myPlayerId ? lastShot.cell : null}
                label="Enemy Waters"
                hoveredCell={hoveredCell}
                onCellClick={handleFire}
                onCellHover={setHoveredCell}
              />
            )}

            {myBoard && (
              <BoardGrid
                cells={myBoard.cells}
                ships={myBoard.ships}
                isOwnBoard={true}
                canFire={false}
                lastShotCell={lastShot?.attackerId === opponentId ? lastShot.cell : null}
                label="Your Fleet"
                hoveredCell={null}
                onCellClick={() => {}}
                onCellHover={() => {}}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground">
        Shots fired: {shotCount}
        {isSpectator && (
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Spectating
          </span>
        )}
      </div>
    </div>
  );
}
