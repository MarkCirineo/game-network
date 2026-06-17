'use client';

// ============================================================
// Tic-Tac-Toe — Game UI Component
// ============================================================

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '@/games/types';
import type { TicTacToeState, TicTacToeAction } from './types';

// ── Mark rendering ──────────────────────────────────────────

function XMark({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={cn('h-8 w-8 sm:h-10 sm:w-10 lg:h-14 lg:w-14 xl:h-20 xl:w-20', className)}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.line
        x1="16" y1="16" x2="48" y2="48"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <motion.line
        x1="48" y1="16" x2="16" y2="48"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
      />
    </motion.svg>
  );
}

function OMark({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={cn('h-8 w-8 sm:h-10 sm:w-10 lg:h-14 lg:w-14 xl:h-20 xl:w-20', className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.circle
        cx="32" cy="32" r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

// ── Cell component ──────────────────────────────────────────

interface CellProps {
  index: number;
  value: string | null;
  isWinning: boolean;
  isMyMark: boolean;
  canPlace: boolean;
  mySymbol: 'X' | 'O' | null;
  onPlace: (index: number) => void;
}

function Cell({ index, value, isWinning, isMyMark, canPlace, mySymbol, onPlace }: CellProps) {
  const isX = value !== null && value === mySymbol ? mySymbol === 'X' : value !== null;
  // Determine whether this cell's occupant is X or O based on player order
  // We'll receive the computed symbol from the parent instead

  return (
    <motion.button
      type="button"
      onClick={() => canPlace && onPlace(index)}
      disabled={!canPlace}
      className={cn(
        'relative flex items-center justify-center',
        'min-h-[60px] min-w-[60px] sm:min-h-[80px] sm:min-w-[80px]',
        'rounded-xl border-2 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        // Base styling
        value === null && canPlace
          ? 'cursor-pointer border-border bg-card hover:border-blue-400/60 hover:bg-blue-500/10'
          : value === null
            ? 'cursor-default border-border bg-card'
            : 'cursor-default border-border bg-card',
        // Winning highlight
        isWinning && 'border-blue-400 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      )}
      whileHover={canPlace ? { scale: 1.05 } : undefined}
      whileTap={canPlace ? { scale: 0.95 } : undefined}
    >
      {/* Hover ghost for empty cells */}
      {value === null && canPlace && mySymbol && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:opacity-20">
          {mySymbol === 'X' ? (
            <XMark className="text-blue-400" />
          ) : (
            <OMark className="text-rose-400" />
          )}
        </span>
      )}

      {/* Placed mark */}
      <AnimatePresence>
        {value !== null && (
          <span key={`mark-${index}`}>
            {/* We need the parent to tell us which symbol this is */}
          </span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Main Game Component ─────────────────────────────────────

export default function TicTacToeGame({
  gameState,
  myPlayerId,
  isMyTurn,
  isSpectator,
  players,
  sendAction,
  phase,
}: GameComponentProps<TicTacToeState, TicTacToeAction>) {
  const { board, currentTurn, players: gamePlayers, moveCount, winningLine } = gameState;

  // Player symbol mapping: first player = X, second = O
  const symbolMap = useMemo(() => {
    const map: Record<string, 'X' | 'O'> = {};
    if (gamePlayers[0]) map[gamePlayers[0]] = 'X';
    if (gamePlayers[1]) map[gamePlayers[1]] = 'O';
    return map;
  }, [gamePlayers]);

  const mySymbol = symbolMap[myPlayerId] ?? null;
  const isGameOver = phase === 'finished' || winningLine !== null || board.every((c) => c !== null);
  const winningSet = useMemo(() => new Set(winningLine ?? []), [winningLine]);

  // Find player names
  const getPlayerName = useCallback(
    (id: string) => players.find((p) => p.id === id)?.name ?? 'Unknown',
    [players],
  );

  const handlePlace = useCallback(
    (cellIndex: number) => {
      if (isSpectator || !isMyTurn || isGameOver) return;
      if (board[cellIndex] !== null) return;
      sendAction({ type: 'place', cellIndex });
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
      return `${getPlayerName(currentTurn)}'s turn (${symbolMap[currentTurn] ?? '?'})`;
    }
    return isMyTurn ? 'Your turn!' : `Waiting for ${getPlayerName(currentTurn)}…`;
  }, [isGameOver, winningLine, board, myPlayerId, isSpectator, currentTurn, isMyTurn, symbolMap, getPlayerName]);

  // Resolve cell symbol from board value (player ID → X/O)
  const getCellSymbol = useCallback(
    (value: string | null): 'X' | 'O' | null => {
      if (value === null) return null;
      return symbolMap[value] ?? null;
    },
    [symbolMap],
  );

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 sm:py-10">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3 xl:max-w-md xl:gap-4">
        {/* Player indicators */}
        <div className="flex w-full items-center justify-between text-sm font-medium xl:text-base">
          {gamePlayers.map((pid, i) => {
            const symbol = i === 0 ? 'X' : 'O';
            const name = getPlayerName(pid);
            const isCurrent = currentTurn === pid && !isGameOver;
            const isWinner = winningLine !== null && board[winningLine[0]] === pid;
            return (
              <motion.div
                key={pid}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors',
                  isCurrent && 'bg-blue-500/15 text-blue-500',
                  isWinner && 'bg-blue-500/20 text-blue-400',
                  !isCurrent && !isWinner && 'text-muted-foreground',
                )}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : undefined}
                transition={isCurrent ? { repeat: Infinity, duration: 2 } : undefined}
              >
                <span className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold',
                  symbol === 'X'
                    ? 'bg-blue-500/20 text-blue-500'
                    : 'bg-rose-500/20 text-rose-500',
                )}>
                  {symbol}
                </span>
                <span className="max-w-[80px] truncate">
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
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-muted text-muted-foreground'
              : isMyTurn
                ? 'bg-blue-500/15 text-blue-500'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {statusMessage}
        </motion.div>
      </div>

      {/* ── Board ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
        {board.map((cell, i) => {
          const symbol = getCellSymbol(cell);
          const isWinCell = winningSet.has(i);
          const canPlace = !isSpectator && isMyTurn && !isGameOver && cell === null;

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => canPlace && handlePlace(i)}
              disabled={!canPlace}
              className={cn(
                'relative flex items-center justify-center',
                'h-[72px] w-[72px] sm:h-[96px] sm:w-[96px] md:h-[110px] md:w-[110px] lg:h-[140px] lg:w-[140px] xl:h-[170px] xl:w-[170px]',
                'rounded-xl border-2 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                // Empty & clickable
                cell === null && canPlace &&
                  'cursor-pointer border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-blue-500/10',
                // Empty & not clickable
                cell === null && !canPlace &&
                  'cursor-default border-white/10 bg-white/[0.03]',
                // Filled
                cell !== null && !isWinCell &&
                  'cursor-default border-white/10 bg-white/5',
                // Winning cell
                isWinCell &&
                  'cursor-default border-blue-400 bg-blue-500/20 shadow-[0_0_24px_rgba(59,130,246,0.35)]',
              )}
              whileHover={canPlace ? { scale: 1.06 } : undefined}
              whileTap={canPlace ? { scale: 0.94 } : undefined}
            >
              <AnimatePresence mode="wait">
                {symbol === 'X' && (
                  <XMark
                    key={`x-${i}`}
                    className={cn(
                      'text-blue-500',
                      isWinCell && 'text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
                    )}
                  />
                )}
                {symbol === 'O' && (
                  <OMark
                    key={`o-${i}`}
                    className={cn(
                      'text-rose-500',
                      isWinCell && 'text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]',
                    )}
                  />
                )}
              </AnimatePresence>

              {/* Subtle hover preview for empty playable cells */}
              {cell === null && canPlace && mySymbol && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 hover:opacity-100 [button:hover>&]:opacity-20">
                  {mySymbol === 'X' ? (
                    <XMark className="text-blue-400" />
                  ) : (
                    <OMark className="text-rose-400" />
                  )}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Footer info ───────────────────────────── */}
      <div className="text-xs text-muted-foreground">
        Move {moveCount} of 9
        {isSpectator && (
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Spectating
          </span>
        )}
      </div>
    </div>
  );
}
