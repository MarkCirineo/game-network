'use client';

// ============================================================
// Rock Paper Scissors — Game UI Component
// ============================================================

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
  isTie,
  delay,
}: {
  playerName: string;
  choice: RPSChoice;
  isWinner: boolean;
  isTie: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border-2 px-6 py-5',
        'min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] xl:min-w-[190px] xl:px-8 xl:py-6',
        isWinner
          ? 'border-orange-400 bg-orange-500/15 shadow-[0_0_24px_rgba(249,115,22,0.3)]'
          : isTie
            ? 'border-amber-400/50 bg-amber-500/10'
            : 'border-white/10 bg-white/5',
      )}
    >
      <motion.span
        className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl"
        animate={
          isWinner
            ? { scale: [1, 1.15, 1] }
            : isTie
              ? { rotate: [0, -5, 5, -5, 0] }
              : undefined
        }
        transition={
          isWinner
            ? { repeat: Infinity, duration: 1.5 }
            : isTie
              ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
              : undefined
        }
      >
        {getChoiceEmoji(choice)}
      </motion.span>
      <span className="text-sm font-medium text-foreground xl:text-base">{playerName}</span>
    </motion.div>
  );
}

// ── Score pill ───────────────────────────────────────────────

function ScorePill({ name, score, isLeading }: { name: string; score: number; isLeading: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium xl:px-4 xl:py-2 xl:text-base',
        isLeading ? 'bg-orange-500/15 text-orange-400' : 'text-muted-foreground',
      )}
    >
      <span className="max-w-[80px] truncate">{name}</span>
      <span className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-md text-xs font-bold xl:h-8 xl:min-w-8 xl:text-sm',
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
    winsNeeded,
    phase: gamePhase,
    lastResult,
  } = gameState;

  const isGameOver = phase === 'finished';
  const myChoice = choices[myPlayerId] ?? null;
  const hasChosen = myChoice !== null;

  // ── Reveal overlay state ───────────────────────────────────
  // Track whether we're in the reveal phase.
  // We use a timer to show the reveal for 2.5 seconds.
  const [revealResult, setRevealResult] = useState<RPSState['lastResult'] | undefined>(undefined);
  const lastResultRef = useRef<string | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Detect new lastResult and show the reveal overlay
  useEffect(() => {
    if (!lastResult) return;

    // Fingerprint the result to detect changes
    const fingerprint = JSON.stringify(lastResult);
    if (fingerprint === lastResultRef.current) return;
    lastResultRef.current = fingerprint;

    // Show the reveal overlay immediately (synchronous with the state update)
    setRevealResult(lastResult);

    // Clear any existing timer
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);

    // Auto-dismiss after 2.5 seconds
    revealTimerRef.current = setTimeout(() => {
      setRevealResult(undefined);
    }, 2500);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [lastResult]);

  // Derived: are we showing the reveal right now?
  const showReveal = revealResult !== undefined;

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
      if (isSpectator || hasChosen || gamePhase !== 'choosing' || isGameOver || showReveal) return;
      sendAction({ type: 'choose', choice });
    },
    [isSpectator, hasChosen, gamePhase, isGameOver, showReveal, sendAction],
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
    if (showReveal) return null; // Overlay handles messaging during reveal
    if (isSpectator) return 'Players are choosing…';
    if (hasChosen) return 'Waiting for opponent…';
    return 'Make your choice!';
  }, [isGameOver, showReveal, isSpectator, hasChosen, scores, myPlayerId, opponentId, getPlayerName]);

  // Derive the reveal badge text and variant
  const revealBadge = useMemo(() => {
    if (!revealResult) return null;
    const isTie = revealResult.winner === null;
    const variant = (() => {
      if (isSpectator) return isTie ? 'tie' as const : 'win' as const;
      if (isTie) return 'tie' as const;
      return revealResult.winner === myPlayerId ? 'win' as const : 'lose' as const;
    })();
    const text = (() => {
      if (isTie) return '🤝 Tie!';
      if (isSpectator) return `${getPlayerName(revealResult.winner!)} wins!`;
      return revealResult.winner === myPlayerId ? '🎉 You win!' : '😤 You lose!';
    })();
    return { text, variant };
  }, [revealResult, isSpectator, myPlayerId, getPlayerName]);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 sm:py-10">
      {/* ── Score header ──────────────────────────── */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3 xl:max-w-lg xl:gap-4">
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
      {statusMessage && (
        <motion.div
          key={statusMessage}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className={cn(
            'text-sm font-semibold xl:text-base',
            hasChosen ? 'text-muted-foreground' : 'text-foreground',
          )}>
            {statusMessage}
          </p>
        </motion.div>
      )}

      {/* ── Central game area (reveal OR choices, never both) ── */}
      <div className="flex min-h-[160px] flex-col items-center justify-center lg:min-h-[200px] xl:min-h-[260px]">
        <AnimatePresence mode="wait">
          {showReveal && revealResult ? (
            /* ── Reveal overlay ── */
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-5"
            >
              <div className="flex items-center gap-4 sm:gap-8 xl:gap-12">
                {gamePlayers.map((pid, i) => {
                  const choice = revealResult.choices[pid];
                  if (!choice) return null;
                  return (
                    <RevealCard
                      key={pid}
                      playerName={getPlayerName(pid)}
                      choice={choice}
                      isWinner={revealResult.winner === pid}
                      isTie={revealResult.winner === null}
                      delay={i * 0.25}
                    />
                  );
                })}
              </div>
              {revealBadge && (
                <OutcomeBadge text={revealBadge.text} variant={revealBadge.variant} />
              )}
            </motion.div>
          ) : gamePhase === 'choosing' && !isGameOver ? (
            /* ── Choice buttons ── */
            <motion.div
              key="choices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
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
                    className="text-5xl xl:text-7xl"
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
                <div className="flex gap-3 sm:gap-5 xl:gap-8">
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
                          'group flex flex-col items-center gap-2 rounded-2xl border-2 px-5 py-4 xl:gap-3 xl:px-8 xl:py-6',
                          'min-h-[100px] min-w-[90px] sm:min-h-[120px] sm:min-w-[110px] lg:min-h-[150px] lg:min-w-[130px] xl:min-h-[180px] xl:min-w-[160px]',
                          'transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
                          disabled
                            ? 'cursor-default border-white/5 bg-white/[0.03] opacity-60'
                            : 'cursor-pointer border-white/10 bg-white/5 hover:border-orange-400/50 hover:bg-orange-500/10',
                        )}
                      >
                        <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl transition-transform duration-200 group-hover:scale-110">
                          {emoji}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground xl:text-sm">{label}</span>
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
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Footer ────────────────────────────────── */}
      <div className="text-xs text-muted-foreground">
        Best of {winsNeeded * 2 - 1}
        {isSpectator && (
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Spectating
          </span>
        )}
      </div>
    </div>
  );
}
