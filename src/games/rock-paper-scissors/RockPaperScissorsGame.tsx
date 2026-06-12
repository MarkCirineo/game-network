'use client';

// ============================================================
// Rock Paper Scissors — Game UI Component
// ============================================================

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '@/games/types';
import type { RPSState, RPSAction, RPSChoice } from './types';
import { getChoiceEmoji } from './logic';

// ── Choice data ─────────────────────────────────────────────

const CHOICES: { value: RPSChoice; emoji: string; label: string }[] = [
  { value: 'rock', emoji: '🪨', label: 'Rock' },
  { value: 'paper', emoji: '📄', label: 'Paper' },
  { value: 'scissors', emoji: '✂️', label: 'Scissors' },
];

// ── Outcome badge ───────────────────────────────────────────

function OutcomeBadge({ text, variant }: { text: string; variant: 'win' | 'lose' | 'tie' }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-bold tracking-wide',
        variant === 'win' && 'bg-emerald-500/20 text-emerald-400',
        variant === 'lose' && 'bg-red-500/20 text-red-400',
        variant === 'tie' && 'bg-amber-500/20 text-amber-400',
      )}
    >
      {text}
    </motion.div>
  );
}

// ── Reveal card ─────────────────────────────────────────────

function RevealCard({
  playerName,
  choice,
  isWinner,
  delay,
}: {
  playerName: string;
  choice: RPSChoice;
  isWinner: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border-2 px-6 py-5',
        'min-w-[120px] sm:min-w-[140px]',
        isWinner
          ? 'border-orange-400 bg-orange-500/15 shadow-[0_0_24px_rgba(249,115,22,0.3)]'
          : 'border-white/10 bg-white/5',
      )}
    >
      <motion.span
        className="text-5xl sm:text-6xl"
        animate={isWinner ? { scale: [1, 1.15, 1] } : undefined}
        transition={isWinner ? { repeat: Infinity, duration: 1.5 } : undefined}
      >
        {getChoiceEmoji(choice)}
      </motion.span>
      <span className="text-sm font-medium text-foreground">{playerName}</span>
    </motion.div>
  );
}

// ── Score pill ───────────────────────────────────────────────

function ScorePill({ name, score, isLeading }: { name: string; score: number; isLeading: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
        isLeading ? 'bg-orange-500/15 text-orange-400' : 'text-muted-foreground',
      )}
    >
      <span className="max-w-[80px] truncate">{name}</span>
      <span className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-md text-xs font-bold',
        isLeading ? 'bg-orange-500/25 text-orange-300' : 'bg-white/10 text-muted-foreground',
      )}>
        {score}
      </span>
    </div>
  );
}

// ── Main Game Component ─────────────────────────────────────

export default function RockPaperScissorsGame({
  gameState,
  myPlayerId,
  isSpectator,
  players,
  sendAction,
  phase,
}: GameComponentProps<RPSState, RPSAction>) {
  const {
    choices,
    players: gamePlayers,
    scores,
    round,
    maxRounds,
    phase: gamePhase,
    lastResult,
  } = gameState;

  const isGameOver = phase === 'finished';
  const myChoice = choices[myPlayerId] ?? null;
  const hasChosen = myChoice !== null;

  const getPlayerName = useCallback(
    (id: string) => {
      if (id === myPlayerId) return 'You';
      return players.find((p) => p.id === id)?.name ?? 'Opponent';
    },
    [players, myPlayerId],
  );

  const opponentId = useMemo(
    () => gamePlayers.find((id) => id !== myPlayerId) ?? gamePlayers[1],
    [gamePlayers, myPlayerId],
  );

  // Score leader detection
  const maxScore = Math.max(...Object.values(scores));

  const handleChoice = useCallback(
    (choice: RPSChoice) => {
      if (isSpectator || hasChosen || gamePhase !== 'choosing' || isGameOver) return;
      sendAction({ type: 'choose', choice });
    },
    [isSpectator, hasChosen, gamePhase, isGameOver, sendAction],
  );

  // Determine status message
  const statusMessage = useMemo(() => {
    if (isGameOver) {
      const myScore = scores[myPlayerId] ?? 0;
      const oppScore = scores[opponentId] ?? 0;
      if (isSpectator) {
        if (myScore === oppScore) return '🤝 Match ended in a draw!';
        const winnerId = myScore > oppScore ? myPlayerId : opponentId;
        return `🏆 ${getPlayerName(winnerId)} wins the match!`;
      }
      if (myScore > oppScore) return '🎉 You won the match!';
      if (myScore < oppScore) return '😔 You lost the match.';
      return '🤝 Match ended in a draw!';
    }
    if (gamePhase === 'reveal' && lastResult) {
      if (lastResult.winner === null) return '🤝 Tie round!';
      return isSpectator
        ? `${getPlayerName(lastResult.winner)} wins the round!`
        : lastResult.winner === myPlayerId
          ? '🎉 You won this round!'
          : '😤 You lost this round.';
    }
    if (isSpectator) return 'Players are choosing…';
    if (hasChosen) return 'Waiting for opponent…';
    return 'Make your choice!';
  }, [isGameOver, gamePhase, lastResult, isSpectator, hasChosen, scores, myPlayerId, opponentId, getPlayerName]);

  // Overall winner result variant
  const resultVariant = useMemo(() => {
    if (!isGameOver) {
      if (gamePhase === 'reveal' && lastResult) {
        if (lastResult.winner === null) return 'tie' as const;
        return lastResult.winner === myPlayerId ? 'win' as const : 'lose' as const;
      }
      return null;
    }
    const myScore = scores[myPlayerId] ?? 0;
    const oppScore = scores[opponentId] ?? 0;
    if (myScore > oppScore) return 'win' as const;
    if (myScore < oppScore) return 'lose' as const;
    return 'tie' as const;
  }, [isGameOver, gamePhase, lastResult, scores, myPlayerId, opponentId]);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 sm:py-10">
      {/* ── Round & Score header ──────────────────── */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        {/* Round indicator */}
        <div className="rounded-full bg-white/5 px-4 py-1 text-xs font-medium text-muted-foreground">
          Round {round} of {maxRounds}
        </div>

        {/* Scores */}
        <div className="flex w-full items-center justify-between">
          {gamePlayers.map((pid) => (
            <ScorePill
              key={pid}
              name={getPlayerName(pid)}
              score={scores[pid] ?? 0}
              isLeading={(scores[pid] ?? 0) === maxScore && maxScore > 0}
            />
          ))}
        </div>
      </div>

      {/* ── Status bar ────────────────────────────── */}
      <motion.div
        key={statusMessage}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {resultVariant && (isGameOver || gamePhase === 'reveal') ? (
          <OutcomeBadge text={statusMessage} variant={isSpectator ? 'tie' : resultVariant} />
        ) : (
          <p className={cn(
            'text-sm font-semibold',
            hasChosen ? 'text-muted-foreground' : 'text-foreground',
          )}>
            {statusMessage}
          </p>
        )}
      </motion.div>

      {/* ── Reveal phase ──────────────────────────── */}
      <AnimatePresence mode="wait">
        {gamePhase === 'reveal' && lastResult && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 sm:gap-8"
          >
            {gamePlayers.map((pid, i) => {
              const choice = lastResult.choices[pid];
              if (!choice) return null;
              return (
                <RevealCard
                  key={pid}
                  playerName={getPlayerName(pid)}
                  choice={choice}
                  isWinner={lastResult.winner === pid}
                  delay={i * 0.25}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Choice buttons (choosing phase) ───────── */}
      <AnimatePresence mode="wait">
        {gamePhase === 'choosing' && !isGameOver && (
          <motion.div
            key="choices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Waiting spinner when already chosen */}
            {hasChosen && !isSpectator && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.span
                  className="text-5xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {getChoiceEmoji(myChoice!)}
                </motion.span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                  Locked in — waiting for opponent
                </div>
              </motion.div>
            )}

            {/* Choice buttons */}
            {(!hasChosen || isSpectator) && (
              <div className="flex gap-3 sm:gap-5">
                {CHOICES.map(({ value, emoji, label }, i) => {
                  const disabled = isSpectator || hasChosen;
                  return (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => handleChoice(value)}
                      disabled={disabled}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                      whileHover={!disabled ? { scale: 1.1, y: -4 } : undefined}
                      whileTap={!disabled ? { scale: 0.92 } : undefined}
                      className={cn(
                        'group flex flex-col items-center gap-2 rounded-2xl border-2 px-5 py-4',
                        'min-h-[100px] min-w-[90px] sm:min-h-[120px] sm:min-w-[110px]',
                        'transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
                        disabled
                          ? 'cursor-default border-white/5 bg-white/[0.03] opacity-60'
                          : 'cursor-pointer border-white/10 bg-white/5 hover:border-orange-400/50 hover:bg-orange-500/10',
                      )}
                    >
                      <span className="text-4xl sm:text-5xl transition-transform duration-200 group-hover:scale-110">
                        {emoji}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Spectator waiting indicator */}
            {isSpectator && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
                Players are choosing
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ────────────────────────────────── */}
      <div className="text-xs text-muted-foreground">
        Best of {maxRounds}
        {isSpectator && (
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Spectating
          </span>
        )}
      </div>
    </div>
  );
}
