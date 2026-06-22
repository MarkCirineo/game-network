'use client';

// ============================================================
// Connect Four — Game UI Component
// ============================================================

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '@/games/types';
import type { ConnectFourState, ConnectFourAction } from './types';
import { COLS, ROWS } from './types';
import { getLowestEmptyRow, isColumnPlayable } from './logic';

// ── Disc component ──────────────────────────────────────────

interface DiscProps {
  color: 'red' | 'yellow';
  isWinning?: boolean;
  dropRow?: number;
  animate?: boolean;
}

function Disc({ color, isWinning = false, dropRow = 0, animate = true }: DiscProps) {
  const baseColor =
    color === 'red'
      ? 'bg-red-500 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3),0_0_0_2px_rgba(239,68,68,0.4)]'
      : 'bg-yellow-400 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3),0_0_0_2px_rgba(250,204,21,0.4)]';

  const glow = isWinning
    ? color === 'red'
      ? 'shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3),0_0_20px_rgba(239,68,68,0.6),0_0_0_3px_rgba(239,68,68,0.5)]'
      : 'shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3),0_0_20px_rgba(255,255,255,0.5),0_0_0_3px_rgba(255,255,200,0.6)]'
    : '';

  // Cell height in pixels (roughly matches the grid cell size)
  // The drop distance is from the top of the board to the target row
  const dropDistance = animate ? -(dropRow + 1) * 68 : 0;

  return (
    <motion.div
      className={cn(
        'h-10 w-10 rounded-full sm:h-12 sm:w-12 lg:h-14 lg:w-14',
        baseColor,
        glow,
      )}
      initial={animate ? { y: dropDistance, scale: 0.8, opacity: 0.7 } : false}
      animate={
        isWinning
          ? { y: 0, scale: [1, 1.15, 1], opacity: 1 }
          : { y: 0, scale: 1, opacity: 1 }
      }
      transition={
        isWinning
          ? { scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }, y: { duration: 0 } }
          : animate
            ? {
                y: { type: 'spring', stiffness: 300, damping: 22, mass: 0.8 },
                scale: { type: 'spring', stiffness: 400, damping: 15 },
                opacity: { duration: 0.1 },
              }
            : { duration: 0 }
      }
    />
  );
}

// ── Ghost Disc (hover preview) ──────────────────────────────

interface GhostDiscProps {
  color: 'red' | 'yellow';
}

function GhostDisc({ color }: GhostDiscProps) {
  return (
    <motion.div
      className={cn(
        'h-10 w-10 rounded-full sm:h-12 sm:w-12 lg:h-14 lg:w-14',
        color === 'red'
          ? 'bg-red-500/25 ring-2 ring-red-500/40'
          : 'bg-yellow-400/25 ring-2 ring-yellow-400/40',
      )}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.15 }}
    />
  );
}

// ── Column drop zone (for hover previews above the board) ───

interface ColumnHeaderProps {
  col: number;
  canDrop: boolean;
  isHovered: boolean;
  discColor: 'red' | 'yellow' | null;
  onHover: (col: number | null) => void;
  onDrop: (col: number) => void;
}

function ColumnHeader({ col, canDrop, isHovered, discColor, onHover, onDrop }: ColumnHeaderProps) {
  return (
    <motion.button
      type="button"
      className={cn(
        'flex items-center justify-center',
        'h-12 w-[52px] sm:h-14 sm:w-[60px] lg:h-16 lg:w-[68px]',
        canDrop ? 'cursor-pointer' : 'cursor-default',
      )}
      onMouseEnter={() => canDrop && onHover(col)}
      onMouseLeave={() => onHover(null)}
      onClick={() => canDrop && onDrop(col)}
      whileTap={canDrop ? { scale: 0.9 } : undefined}
      disabled={!canDrop}
    >
      <AnimatePresence>
        {isHovered && canDrop && discColor && (
          <GhostDisc key="ghost" color={discColor} />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Main Game Component ─────────────────────────────────────

export default function ConnectFourGame({
  gameState,
  myPlayerId,
  isMyTurn,
  isSpectator,
  players,
  sendAction,
  phase,
}: GameComponentProps<ConnectFourState, ConnectFourAction>) {
  const { board, currentTurn, players: gamePlayers, moveCount, winningLine, lastDrop } = gameState;

  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  // Player color mapping: first player = Red, second = Yellow
  const colorMap = useMemo(() => {
    const map: Record<string, 'red' | 'yellow'> = {};
    if (gamePlayers[0]) map[gamePlayers[0]] = 'red';
    if (gamePlayers[1]) map[gamePlayers[1]] = 'yellow';
    return map;
  }, [gamePlayers]);

  const myColor = colorMap[myPlayerId] ?? null;
  const isGameOver = phase === 'finished' || winningLine !== null || board.every((c) => c !== null);
  const winningSet = useMemo(() => new Set(winningLine ?? []), [winningLine]);

  // Find player names
  const getPlayerName = useCallback(
    (id: string) => players.find((p) => p.id === id)?.name ?? 'Unknown',
    [players],
  );

  const handleDrop = useCallback(
    (column: number) => {
      if (isSpectator || !isMyTurn || isGameOver) return;
      if (!isColumnPlayable(board, column)) return;
      sendAction({ type: 'drop', column });
      setHoveredCol(null);
    },
    [isSpectator, isMyTurn, isGameOver, board, sendAction],
  );

  // Determine status message
  const statusMessage = useMemo(() => {
    if (isGameOver) {
      if (winningLine) {
        const winnerId = board[winningLine[0]];
        if (!winnerId) return 'Game over!';
        const isMe = winnerId === myPlayerId;
        return isMe ? '🎉 You won!' : `${getPlayerName(winnerId)} wins!`;
      }
      return "🤝 It's a draw!";
    }
    if (isSpectator) {
      const turnColor = colorMap[currentTurn] === 'red' ? '🔴' : '🟡';
      return `${getPlayerName(currentTurn)}'s turn ${turnColor}`;
    }
    return isMyTurn ? 'Your turn — drop a disc!' : `Waiting for ${getPlayerName(currentTurn)}…`;
  }, [isGameOver, winningLine, board, myPlayerId, isSpectator, currentTurn, isMyTurn, colorMap, getPlayerName]);

  // Get disc color for a cell value
  const getCellColor = useCallback(
    (value: string | null): 'red' | 'yellow' | null => {
      if (value === null) return null;
      return colorMap[value] ?? null;
    },
    [colorMap],
  );

  // Build the board as rows of cells
  const rows = useMemo(() => {
    const result: { index: number; col: number; row: number; value: string | null }[][] = [];
    for (let row = 0; row < ROWS; row++) {
      const rowCells: typeof result[number] = [];
      for (let col = 0; col < COLS; col++) {
        const index = row * COLS + col;
        rowCells.push({ index, col, row, value: board[index] });
      }
      result.push(rowCells);
    }
    return result;
  }, [board]);

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6 sm:gap-6 sm:py-10">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex w-full max-w-md flex-col items-center gap-3 xl:max-w-lg xl:gap-4">
        {/* Player indicators */}
        <div className="flex w-full items-center justify-between text-sm font-medium xl:text-base">
          {gamePlayers.map((pid, i) => {
            const color = i === 0 ? 'red' : 'yellow';
            const label = i === 0 ? '🔴' : '🟡';
            const name = getPlayerName(pid);
            const isCurrent = currentTurn === pid && !isGameOver;
            const isWinner = winningLine !== null && board[winningLine[0]] === pid;
            return (
              <motion.div
                key={pid}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors',
                  isCurrent && color === 'red' && 'bg-red-500/15 text-red-400',
                  isCurrent && color === 'yellow' && 'bg-yellow-500/15 text-yellow-400',
                  isWinner && color === 'red' && 'bg-red-500/20 text-red-400',
                  isWinner && color === 'yellow' && 'bg-yellow-500/20 text-yellow-400',
                  !isCurrent && !isWinner && 'text-muted-foreground',
                )}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : undefined}
                transition={isCurrent ? { repeat: Infinity, duration: 2 } : undefined}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-sm',
                    color === 'red'
                      ? 'bg-red-500/20'
                      : 'bg-yellow-400/20',
                  )}
                >
                  {label}
                </span>
                <span className="max-w-[100px] truncate">
                  {pid === myPlayerId ? 'You' : name}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Status bar */}
        <motion.div
          key={statusMessage}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-semibold xl:px-5 xl:py-2 xl:text-base',
            isGameOver
              ? winningLine
                ? board[winningLine[0]] === gamePlayers[0]
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-yellow-500/15 text-yellow-400'
                : 'bg-muted text-muted-foreground'
              : isMyTurn
                ? myColor === 'red'
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-yellow-500/15 text-yellow-400'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {statusMessage}
        </motion.div>
      </div>

      {/* ── Column hover zone (drop preview) ──────── */}
      <div className="flex gap-1 sm:gap-1.5 lg:gap-2">
        {Array.from({ length: COLS }, (_, col) => {
          const canDrop = !isSpectator && isMyTurn && !isGameOver && isColumnPlayable(board, col);
          return (
            <ColumnHeader
              key={col}
              col={col}
              canDrop={canDrop}
              isHovered={hoveredCol === col}
              discColor={myColor}
              onHover={setHoveredCol}
              onDrop={handleDrop}
            />
          );
        })}
      </div>

      {/* ── Board ─────────────────────────────────── */}
      <div
        className={cn(
          'rounded-2xl border-2 border-blue-600/50 bg-blue-700 p-2 sm:p-2.5 lg:p-3',
          'shadow-[0_8px_32px_rgba(29,78,216,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)]',
        )}
        onMouseLeave={() => setHoveredCol(null)}
      >
        <div className="flex flex-col gap-1 sm:gap-1.5 lg:gap-2">
          {rows.map((rowCells, rowIdx) => (
            <div key={rowIdx} className="flex gap-1 sm:gap-1.5 lg:gap-2">
              {rowCells.map(({ index, col, row, value }) => {
                const discColor = getCellColor(value);
                const isWinCell = winningSet.has(index);
                const canDrop = !isSpectator && isMyTurn && !isGameOver && isColumnPlayable(board, col);
                const isThisColHovered = hoveredCol === col && canDrop;
                const isLastDrop = lastDrop?.col === col && lastDrop?.row === row;

                return (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => canDrop && handleDrop(col)}
                    onMouseEnter={() => canDrop && setHoveredCol(col)}
                    disabled={!canDrop}
                    className={cn(
                      'relative flex items-center justify-center',
                      'h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] lg:h-[68px] lg:w-[68px]',
                      'rounded-full transition-all duration-200',
                      // Empty cell appearance
                      value === null && 'bg-blue-900/80 shadow-[inset_0_3px_8px_rgba(0,0,0,0.4)]',
                      // Hovered column highlight
                      value === null && isThisColHovered && 'bg-blue-800/90',
                      // Clickable cursor
                      canDrop ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {discColor && (
                        <Disc
                          key={`disc-${index}`}
                          color={discColor}
                          isWinning={isWinCell}
                          dropRow={row}
                          animate={isLastDrop}
                        />
                      )}
                    </AnimatePresence>

                    {/* Winning pulse ring */}
                    {isWinCell && discColor && (
                      <motion.div
                        className={cn(
                          'pointer-events-none absolute inset-0 rounded-full',
                          discColor === 'red'
                            ? 'ring-2 ring-red-400/60'
                            : 'ring-2 ring-white/60',
                        )}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.3, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer info ───────────────────────────── */}
      <div className="text-xs text-muted-foreground">
        Move {moveCount} of 42
        {isSpectator && (
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Spectating
          </span>
        )}
      </div>
    </div>
  );
}
