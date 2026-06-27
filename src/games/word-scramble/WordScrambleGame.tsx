'use client';

// ============================================================
// Word Scramble — Game UI Component
// Playing → Reveal → Next Round loop with countdown timer
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '@/games/types';
import type { WordScrambleState, WordScrambleAction } from './types';
import { getThemeMeta } from './logic';

// ── Letter Tile ─────────────────────────────────────────────

function LetterTile({ letter, index }: { letter: string; index: number }) {
  return (
    <motion.div
      key={`${letter}-${index}`}
      initial={{ scale: 0, rotateY: 90 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'flex h-12 w-10 items-center justify-center sm:h-14 sm:w-12 md:h-16 md:w-14',
        'rounded-lg border-2 border-violet-500/30 bg-violet-500/10',
        'text-xl font-bold uppercase text-violet-300 sm:text-2xl md:text-3xl',
        'shadow-lg shadow-violet-500/10',
      )}
    >
      {letter}
    </motion.div>
  );
}

// ── Countdown Timer Bar ─────────────────────────────────────

function CountdownBar({
  roundStartTime,
  roundDurationMs,
  onTimeout,
}: {
  roundStartTime: number;
  roundDurationMs: number;
  onTimeout: () => void;
}) {
  const [progress, setProgress] = useState(1);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    const endTime = roundStartTime + roundDurationMs;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const pct = remaining / roundDurationMs;
      setProgress(pct);

      if (remaining <= 0) {
        onTimeoutRef.current();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [roundStartTime, roundDurationMs]);

  const seconds = Math.ceil(progress * (roundDurationMs / 1000));
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  return (
    <div className="w-full max-w-md">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Time remaining</span>
        <span
          className={cn(
            'font-mono font-bold tabular-nums',
            isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-violet-400',
          )}
        >
          {seconds}s
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors duration-500',
            isCritical
              ? 'bg-red-500'
              : isLow
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500',
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── Score Leaderboard ───────────────────────────────────────

function ScoreBoard({
  players,
  scores,
  playerNames,
  currentTurnSolverId,
}: {
  players: string[];
  scores: Record<string, number>;
  playerNames: Record<string, string>;
  currentTurnSolverId?: string | null;
}) {
  const sorted = useMemo(() => {
    return [...players].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  }, [players, scores]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {sorted.map((pid) => {
        const name = playerNames[pid] ?? 'Unknown';
        const score = scores[pid] ?? 0;
        const isLeader = score > 0 && score === Math.max(...Object.values(scores));
        const justSolved = pid === currentTurnSolverId;

        return (
          <motion.div
            key={pid}
            layout
            animate={justSolved ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
              isLeader
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                : 'bg-white/5 text-muted-foreground',
            )}
          >
            <span className="max-w-[100px] truncate">{name}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-bold',
                isLeader ? 'bg-violet-500/30 text-violet-200' : 'bg-white/10',
              )}
            >
              {score}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function WordScrambleGame({
  gameState,
  myPlayerId,
  isSpectator,
  players,
  sendAction,
  phase: gamePhase,
}: GameComponentProps<WordScrambleState, WordScrambleAction>) {
  const {
    phase,
    round,
    gameMode,
    target,
    theme,
    scores,
    scrambledWord,
    solved,
    roundStartTime,
    roundDurationMs,
    lastResult,
    players: gamePlayers,
    playerNames,
  } = gameState;

  const [inputValue, setInputValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const [timeoutSent, setTimeoutSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGameOver = phase === 'finished' || gamePhase === 'finished';
  const hasSolved = solved[myPlayerId] ?? false;
  const themeMeta = getThemeMeta(theme);

  const getPlayerName = useCallback(
    (id: string) => playerNames[id] ?? players.find((p) => p.id === id)?.name ?? 'Unknown',
    [playerNames, players],
  );

  // Game mode display
  const modeLabel = useMemo(() => {
    if (gameMode === 'firstTo') return `First to ${target}`;
    return `Round ${round} of ${target}`;
  }, [gameMode, target, round]);

  // Reset input when round changes
  useEffect(() => {
    setInputValue('');
    setTimeoutSent(false);
    if (phase === 'playing' && !isSpectator) {
      // Focus input after a short delay to let animations settle
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [round, phase, isSpectator]);

  // Auto-advance from reveal phase after 3 seconds
  useEffect(() => {
    if (phase === 'reveal' && !isGameOver) {
      revealTimerRef.current = setTimeout(() => {
        sendAction({ type: 'next_round' });
      }, 3000);
      return () => {
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      };
    }
  }, [phase, isGameOver, sendAction, round]);

  // Handle guess submission
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (isSpectator || hasSolved || phase !== 'playing' || !inputValue.trim()) return;
      sendAction({ type: 'guess', word: inputValue.trim() });
      // We don't know if it's correct yet — the server will update state.
      // But we optimistically clear and prepare for next guess.
      // If wrong, we'll know because phase stays 'playing' and solved stays false.
      setInputValue('');
    },
    [isSpectator, hasSolved, phase, inputValue, sendAction],
  );

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (timeoutSent || phase !== 'playing') return;
    setTimeoutSent(true);
    sendAction({ type: 'timeout' });
  }, [timeoutSent, phase, sendAction]);

  // Shake animation on wrong guess — detect by watching if solved stays false
  // after a guess. We use a simple approach: shake the input briefly.
  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  // Track if we submitted and the state came back still unsolved
  const lastGuessRef = useRef<string | null>(null);
  const prevSolvedRef = useRef(hasSolved);

  useEffect(() => {
    // If we had a pending guess and we're still unsolved, it was wrong
    if (lastGuessRef.current && !hasSolved && !prevSolvedRef.current && phase === 'playing') {
      triggerShake();
    }
    lastGuessRef.current = null;
    prevSolvedRef.current = hasSolved;
  }, [gameState, hasSolved, phase, triggerShake]);

  const handleSubmitWithTracking = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (isSpectator || hasSolved || phase !== 'playing' || !inputValue.trim()) return;
      lastGuessRef.current = inputValue.trim();
      sendAction({ type: 'guess', word: inputValue.trim() });
      setInputValue('');
    },
    [isSpectator, hasSolved, phase, inputValue, sendAction],
  );

  // ── Playing Phase ───────────────────────────────────────────
  if (phase === 'playing') {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        {/* Header: round info + theme */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>{themeMeta.emoji} {themeMeta.label}</span>
            <span className="text-white/10">|</span>
            <span>{modeLabel}</span>
          </div>
        </div>

        {/* Scores */}
        <ScoreBoard
          players={gamePlayers}
          scores={scores}
          playerNames={playerNames}
        />

        {/* Scrambled word tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-4">
          {scrambledWord.split('').map((letter, i) => (
            <LetterTile key={`${round}-${i}`} letter={letter} index={i} />
          ))}
        </div>

        {/* Timer */}
        <CountdownBar
          roundStartTime={roundStartTime}
          roundDurationMs={roundDurationMs}
          onTimeout={handleTimeout}
        />

        {/* Input area */}
        {!isSpectator && !hasSolved && (
          <form onSubmit={handleSubmitWithTracking} className="w-full max-w-md">
            <motion.div
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your guess..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className={cn(
                  'w-full rounded-xl border-2 bg-white/5 px-4 py-3 text-center text-lg font-medium',
                  'placeholder:text-muted-foreground/50 focus:outline-none',
                  'transition-colors duration-200',
                  shaking
                    ? 'border-red-500/60 text-red-300'
                    : 'border-violet-500/30 text-white focus:border-violet-500/60',
                )}
              />
            </motion.div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Press <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">Enter</span> to submit
            </p>
          </form>
        )}

        {/* Already solved feedback */}
        {!isSpectator && hasSolved && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-xl bg-emerald-500/15 px-6 py-3 text-emerald-400"
          >
            ✅ You got it! Waiting for the round to end…
          </motion.div>
        )}

        {/* Spectator label */}
        {isSpectator && (
          <div className="rounded-full bg-muted px-4 py-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            Spectating
          </div>
        )}
      </div>
    );
  }

  // ── Reveal Phase ────────────────────────────────────────────
  if ((phase === 'reveal' || phase === 'finished') && lastResult) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        {/* Scores */}
        <ScoreBoard
          players={gamePlayers}
          scores={scores}
          playerNames={playerNames}
          currentTurnSolverId={lastResult.solverId}
        />

        {/* Result card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-8 py-6"
        >
          {lastResult.solverId ? (
            <>
              <span className="text-4xl">🎉</span>
              <p className="text-lg font-bold text-emerald-400">
                {lastResult.solverId === myPlayerId
                  ? 'You got it!'
                  : `${getPlayerName(lastResult.solverId)} got it!`}
              </p>
            </>
          ) : (
            <>
              <span className="text-4xl">⏰</span>
              <p className="text-lg font-bold text-amber-400">Time&apos;s up!</p>
            </>
          )}

          {/* Revealed word */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">The word was:</span>
            <span className="text-xl font-bold uppercase tracking-wider text-white">
              {lastResult.word}
            </span>
          </div>
        </motion.div>

        {/* Round info */}
        <p className="text-sm text-muted-foreground">
          {gameMode === 'firstTo'
            ? `First to ${target} points`
            : `Round ${round} of ${target}`}
          <span className="mx-2 text-white/10">|</span>
          {(gameMode === 'rounds' && round >= target) ||
           (gameMode === 'firstTo' && Math.max(...Object.values(scores)) >= target)
            ? 'Final results incoming…'
            : 'Next round starting…'}
        </p>
      </div>
    );
  }

  // Fallback — shouldn't reach here, but just in case
  return null;
}
