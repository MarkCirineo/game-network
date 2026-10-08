'use client';

// ============================================================
// Hangman — Game UI Component
// Turn-based letter guessing: gallows, word tiles, letter
// keyboard, and a full-word solve input on your turn.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '@/games/types';
import type { HangmanState, HangmanAction } from './types';
import { ALPHABET, getThemeMeta, letterStatus, visibleParts } from './logic';

// ── Gallows Drawing ─────────────────────────────────────────

/**
 * The 10 drawable parts in draw order: 4 scaffold pieces, then
 * 6 body parts. visibleParts() decides how many are shown.
 */
function Gallows({ strikes, maxStrikes }: { strikes: number; maxStrikes: number }) {
  const visible = visibleParts(strikes, maxStrikes);

  const parts = [
    /* 0 base  */ <line key="base" x1="10" y1="95" x2="60" y2="95" />,
    /* 1 pole  */ <line key="pole" x1="25" y1="95" x2="25" y2="8" />,
    /* 2 beam  */ <line key="beam" x1="25" y1="8" x2="68" y2="8" />,
    /* 3 rope  */ <line key="rope" x1="68" y1="8" x2="68" y2="20" />,
    /* 4 head  */ <circle key="head" cx="68" cy="28" r="8" fill="none" />,
    /* 5 body  */ <line key="body" x1="68" y1="36" x2="68" y2="60" />,
    /* 6 arm L */ <line key="armL" x1="68" y1="43" x2="56" y2="53" />,
    /* 7 arm R */ <line key="armR" x1="68" y1="43" x2="80" y2="53" />,
    /* 8 leg L */ <line key="legL" x1="68" y1="60" x2="58" y2="77" />,
    /* 9 leg R */ <line key="legR" x1="68" y1="60" x2="78" y2="77" />,
  ];

  return (
    <svg
      viewBox="0 0 90 100"
      className="h-28 w-24 sm:h-32 sm:w-28"
      aria-label={`Gallows: ${strikes} of ${maxStrikes} strikes`}
    >
      {parts.slice(0, visible).map((part, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'stroke-2 [stroke-linecap:round]',
            // Body parts glow amber as danger rises
            i >= 4 ? 'stroke-amber-400/90' : 'stroke-white/30',
          )}
        >
          {part}
        </motion.g>
      ))}
    </svg>
  );
}

// ── Word Tiles ──────────────────────────────────────────────

function WordDisplay({ maskedWord, round }: { maskedWord: string; round: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {maskedWord.split('').map((ch, i) => {
        const hidden = ch === '_';
        return (
          <motion.div
            key={`${round}-${i}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 22 }}
            className={cn(
              'flex h-11 w-9 items-center justify-center rounded-lg border-b-4 sm:h-14 sm:w-11',
              'text-xl font-bold uppercase sm:text-2xl',
              hidden
                ? 'border-white/20 bg-white/5 text-transparent'
                : 'border-amber-500/50 bg-amber-500/10 text-amber-300',
            )}
          >
            {hidden ? '·' : ch}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Letter Keyboard ─────────────────────────────────────────

function LetterKeyboard({
  maskedWord,
  guessedLetters,
  disabled,
  onGuess,
}: {
  maskedWord: string;
  guessedLetters: string[];
  disabled: boolean;
  onGuess: (letter: string) => void;
}) {
  return (
    <div className="flex max-w-lg flex-wrap items-center justify-center gap-1.5">
      {ALPHABET.map((letter) => {
        const status = letterStatus(letter, maskedWord, guessedLetters);
        const isGuessed = status !== 'unguessed';

        return (
          <button
            key={letter}
            onClick={() => onGuess(letter)}
            disabled={disabled || isGuessed}
            className={cn(
              'flex h-10 w-9 items-center justify-center rounded-lg text-sm font-bold uppercase transition-all sm:h-11 sm:w-10',
              status === 'correct' && 'bg-emerald-500/20 text-emerald-400',
              status === 'wrong' && 'bg-red-500/10 text-red-400/50 line-through',
              status === 'unguessed' &&
                (disabled
                  ? 'bg-white/5 text-text-muted'
                  : 'bg-white/10 text-text-primary hover:bg-amber-500/20 hover:text-amber-300 active:scale-95'),
            )}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

// ── Score Leaderboard ───────────────────────────────────────

function ScoreBoard({
  players,
  scores,
  playerNames,
  currentTurn,
  highlightId,
}: {
  players: string[];
  scores: Record<string, number>;
  playerNames: Record<string, string>;
  currentTurn?: string | null;
  highlightId?: string | null;
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
        const isTurn = pid === currentTurn;

        return (
          <motion.div
            key={pid}
            layout
            animate={pid === highlightId ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
              isTurn
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                : isLeader
                  ? 'bg-white/10 text-text-primary'
                  : 'bg-white/5 text-muted-foreground',
            )}
          >
            {isTurn && <span className="text-xs">✏️</span>}
            <span className="max-w-[100px] truncate">{name}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                isTurn ? 'bg-amber-500/30 text-amber-200' : 'bg-white/10',
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

export default function HangmanGame({
  gameState,
  myPlayerId,
  isSpectator,
  players,
  sendAction,
  phase: gamePhase,
}: GameComponentProps<HangmanState, HangmanAction>) {
  const {
    phase,
    round,
    totalRounds,
    theme,
    maxStrikes,
    strikes,
    word,
    guessedLetters,
    currentTurn,
    scores,
    lastResult,
    players: gamePlayers,
    playerNames,
  } = gameState;

  // Solve-box state is tagged with the turn it was opened on, so a new
  // round or turn reads as closed/empty without a resetting effect
  const turnKey = `${round}:${currentTurn}`;
  const [solve, setSolve] = useState({ turnKey, open: false, value: '' });
  const solveOpen = solve.turnKey === turnKey && solve.open;
  const solveValue = solve.turnKey === turnKey ? solve.value : '';
  const setSolveOpen = (open: boolean) => setSolve({ turnKey, open, value: '' });
  const setSolveValue = (value: string) => setSolve({ turnKey, open: true, value });
  const solveInputRef = useRef<HTMLInputElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGameOver = phase === 'finished' || gamePhase === 'finished';
  const isMyTurn = !isSpectator && currentTurn === myPlayerId;
  const themeMeta = getThemeMeta(theme);

  const getPlayerName = useCallback(
    (id: string) => playerNames[id] ?? players.find((p) => p.id === id)?.name ?? 'Unknown',
    [playerNames, players],
  );

  // Focus the solve input when opened
  useEffect(() => {
    if (solveOpen) {
      setTimeout(() => solveInputRef.current?.focus(), 100);
    }
  }, [solveOpen]);

  // Auto-advance from reveal phase after 3 seconds. Never after the final
  // round: the server ends the match there, and the game_over UI arrives on
  // a delayed timer that can lose the race to this one.
  useEffect(() => {
    if (phase === 'reveal' && !isGameOver && round < totalRounds) {
      revealTimerRef.current = setTimeout(() => {
        sendAction({ type: 'next_round' });
      }, 3000);
      return () => {
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      };
    }
  }, [phase, isGameOver, sendAction, round, totalRounds]);

  const handleGuessLetter = useCallback(
    (letter: string) => {
      if (!isMyTurn || phase !== 'playing') return;
      sendAction({ type: 'guess_letter', letter });
    },
    [isMyTurn, phase, sendAction],
  );

  const handleSolve = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const guess = solveValue.trim();
      if (!isMyTurn || phase !== 'playing' || !/^[a-zA-Z]+$/.test(guess)) return;
      sendAction({ type: 'guess_word', word: guess });
      setSolve({ turnKey, open: false, value: '' });
    },
    [isMyTurn, phase, solveValue, sendAction, turnKey],
  );

  // Physical keyboard support for letter guessing on your turn
  useEffect(() => {
    if (!isMyTurn || phase !== 'playing' || solveOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key) && !guessedLetters.includes(key)) {
        sendAction({ type: 'guess_letter', letter: key });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMyTurn, phase, solveOpen, guessedLetters, sendAction]);

  const wrongCount = strikes;
  const strikesLeft = maxStrikes - strikes;

  // ── Playing Phase ───────────────────────────────────────────
  if (phase === 'playing') {
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-6">
        {/* Header: theme + round */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{themeMeta.emoji} {themeMeta.label}</span>
          <span className="text-white/10">|</span>
          <span>Round {round} of {totalRounds}</span>
        </div>

        {/* Scores */}
        <ScoreBoard
          players={gamePlayers}
          scores={scores}
          playerNames={playerNames}
          currentTurn={currentTurn}
        />

        {/* Gallows + strikes */}
        <div className="flex items-center gap-6">
          <Gallows strikes={strikes} maxStrikes={maxStrikes} />
          <div className="text-center">
            <div
              className={cn(
                'text-3xl font-bold tabular-nums',
                strikesLeft <= 2 ? 'text-red-400' : strikesLeft <= 4 ? 'text-amber-400' : 'text-text-primary',
              )}
            >
              {wrongCount}/{maxStrikes}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              strikes
            </div>
          </div>
        </div>

        {/* Word */}
        <WordDisplay maskedWord={word} round={round} />

        {/* Turn indicator */}
        <div className="h-6 text-sm">
          {isMyTurn ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="font-semibold text-amber-400"
            >
              Your turn — pick a letter
            </motion.span>
          ) : (
            <span className="text-muted-foreground">
              {isSpectator ? 'Spectating' : `Waiting for ${getPlayerName(currentTurn)}…`}
            </span>
          )}
        </div>

        {/* Keyboard */}
        <LetterKeyboard
          maskedWord={word}
          guessedLetters={guessedLetters}
          disabled={!isMyTurn}
          onGuess={handleGuessLetter}
        />

        {/* Solve the word */}
        {isMyTurn && (
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {solveOpen ? (
                <motion.form
                  key="solve-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  onSubmit={handleSolve}
                  className="flex gap-2"
                >
                  <input
                    ref={solveInputRef}
                    type="text"
                    value={solveValue}
                    onChange={(e) => setSolveValue(e.target.value)}
                    placeholder="Type the full word…"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="flex-1 rounded-xl border-2 border-amber-500/30 bg-white/5 px-4 py-2.5 text-center font-medium text-white placeholder:text-muted-foreground/50 focus:border-amber-500/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!/^[a-zA-Z]+$/.test(solveValue.trim())}
                    className="rounded-xl bg-amber-500/20 px-4 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/30 disabled:opacity-40"
                  >
                    Solve
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolveOpen(false)}
                    className="rounded-xl bg-white/5 px-3 text-sm text-muted-foreground hover:bg-white/10"
                  >
                    ✕
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="solve-toggle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <button
                    onClick={() => setSolveOpen(true)}
                    className="text-sm font-medium text-amber-400/80 underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                  >
                    🎯 I know the word — solve it
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Correct: +20 per hidden letter · Wrong: a strike, and your turn passes
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  // ── Reveal Phase ────────────────────────────────────────────
  if ((phase === 'reveal' || phase === 'finished') && lastResult) {
    const solved = lastResult.outcome === 'solved';

    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        <ScoreBoard
          players={gamePlayers}
          scores={scores}
          playerNames={playerNames}
          highlightId={lastResult.solverId}
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-8 py-6"
        >
          {solved ? (
            <>
              <span className="text-4xl">🎉</span>
              <p className="text-lg font-bold text-emerald-400">
                {lastResult.solverId === myPlayerId
                  ? 'You solved it!'
                  : `${getPlayerName(lastResult.solverId ?? '')} solved it!`}
              </p>
            </>
          ) : (
            <>
              <span className="text-4xl">💀</span>
              <p className="text-lg font-bold text-red-400">
                The gallows is complete — nobody solved it!
              </p>
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">The word was:</span>
            <span className="text-xl font-bold uppercase tracking-wider text-white">
              {lastResult.word}
            </span>
          </div>
        </motion.div>

        <p className="text-sm text-muted-foreground">
          Round {round} of {totalRounds}
          <span className="mx-2 text-white/10">|</span>
          {round >= totalRounds ? 'Final results incoming…' : 'Next round starting…'}
        </p>
      </div>
    );
  }

  // Fallback — shouldn't reach here, but just in case
  return null;
}
