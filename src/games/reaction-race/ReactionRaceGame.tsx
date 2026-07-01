// ============================================================
// Reaction Race — Game Component
// Full-screen reaction time game with WAIT → GO transitions.
// ============================================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/games/types';
import type { ReactionRaceState, ReactionRaceAction, ReactionValue } from './types';

// ── Score Board ─────────────────────────────────────────────

function ScoreBoard({
  players,
  scores,
  playerNames,
  myPlayerId,
  highlightId,
}: {
  players: string[];
  scores: Record<string, number>;
  playerNames: Record<string, string>;
  myPlayerId: string;
  highlightId?: string | null;
}) {
  const sorted = [...players].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {sorted.map((pid) => (
        <div
          key={pid}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            pid === highlightId
              ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
              : 'bg-white/5 text-white/70'
          }`}
        >
          <span>{playerNames[pid] ?? pid}</span>
          {pid === myPlayerId && (
            <span className="ml-1 text-[10px] text-white/40">(You)</span>
          )}
          <span className="ml-2 font-bold tabular-nums">{scores[pid] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

// ── Reaction Time Display ───────────────────────────────────

function ReactionDisplay({
  reaction,
  playerName,
  isWinner,
  isMe,
}: {
  reaction: number | 'false_start' | 'no_reaction';
  playerName: string;
  isWinner: boolean;
  isMe: boolean;
}) {
  let display: string;
  let color: string;
  let icon: string;

  if (reaction === 'false_start') {
    display = 'Too Early!';
    color = 'text-red-400';
    icon = '🚫';
  } else if (reaction === 'no_reaction') {
    display = 'No Reaction';
    color = 'text-white/40';
    icon = '💤';
  } else {
    display = `${reaction}ms`;
    color = isWinner ? 'text-emerald-400' : 'text-white/70';
    icon = isWinner ? '🏆' : '⚡';
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
        isWinner ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'bg-white/5'
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className={`font-medium ${isWinner ? 'text-emerald-400' : 'text-white/80'}`}>
          {playerName}
          {isMe && <span className="ml-1 text-[10px] text-white/40">(You)</span>}
        </span>
      </div>
      <span className={`font-bold tabular-nums ${color}`}>{display}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function ReactionRaceGame({
  gameState,
  myPlayerId,
  isSpectator,
  sendAction,
}: GameComponentProps<ReactionRaceState, ReactionRaceAction>) {
  const {
    phase,
    round,
    gameMode,
    target,
    scores,
    goTime,
    reactions,
    lastResult,
    countdownStartTime,
    players,
    playerNames,
  } = gameState;

  // ── Local visual state ──────────────────────────────────────
  const [visualGo, setVisualGo] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [resultCountdown, setResultCountdown] = useState(5);
  const [hasClicked, setHasClicked] = useState(false);
  const [myReactionTime, setMyReactionTime] = useState<number | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);

  const rafRef = useRef<number>(0);
  const goTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myReaction: ReactionValue = reactions[myPlayerId] ?? null;
  const isGameOver = phase === 'finished';

  // ── Reset local state on phase/round changes ─────────────
  useEffect(() => {
    if (phase === 'waiting') {
      setVisualGo(false);
      setElapsedMs(0);
      setHasClicked(false);
      setMyReactionTime(null);
      setFlashVisible(false);
    }
  }, [phase, round]);

  // ── Waiting → GO visual transition ────────────────────────
  useEffect(() => {
    if (phase !== 'waiting' || goTime <= 0) return;

    const timeUntilGo = goTime - Date.now();
    if (timeUntilGo <= 0) {
      setVisualGo(true);
      setFlashVisible(true);
      setTimeout(() => setFlashVisible(false), 300);
    } else {
      goTimerRef.current = setTimeout(() => {
        setVisualGo(true);
        setFlashVisible(true);
        setTimeout(() => setFlashVisible(false), 300);
      }, timeUntilGo);
    }

    return () => {
      if (goTimerRef.current) clearTimeout(goTimerRef.current);
    };
  }, [phase, goTime]);

  // ── Round timeout — 5 seconds after GO ────────────────────
  useEffect(() => {
    if (phase !== 'waiting' || goTime <= 0) return;

    const timeUntilTimeout = (goTime + 5000) - Date.now();
    if (timeUntilTimeout <= 0) {
      sendAction({ type: 'timeout' });
      return;
    }

    timeoutTimerRef.current = setTimeout(() => {
      sendAction({ type: 'timeout' });
    }, timeUntilTimeout);

    return () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [phase, goTime, sendAction]);

  // ── Live millisecond counter ──────────────────────────────
  useEffect(() => {
    if (phase !== 'waiting' || !visualGo || hasClicked) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const animate = () => {
      setElapsedMs(Date.now() - goTime);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, visualGo, hasClicked, goTime]);

  // ── Result phase — auto-advance countdown ─────────────────
  useEffect(() => {
    if (phase !== 'result') return;

    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((5000 - elapsed) / 1000));
      setResultCountdown(remaining);

      if (remaining <= 0 && !isGameOver) {
        sendAction({ type: 'next_round' });
      }
    };

    setResultCountdown(5);
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [phase, isGameOver, sendAction]);

  // ── Click handler ─────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (isSpectator || hasClicked || phase !== 'waiting') return;

    setHasClicked(true);

    if (!visualGo) {
      // Clicked before GO — false start
      setMyReactionTime(-1);
      sendAction({ type: 'react', reactionTime: -1 });
    } else {
      // Valid reaction
      const rt = Date.now() - goTime;
      setMyReactionTime(rt);
      sendAction({ type: 'react', reactionTime: rt });
    }
  }, [isSpectator, hasClicked, phase, visualGo, goTime, sendAction]);

  // ── Keyboard support (Space/Enter to click) ───────────────
  useEffect(() => {
    if (phase !== 'waiting' || isSpectator) return;

    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, isSpectator, handleClick]);

  // ── Helper ────────────────────────────────────────────────
  const getPlayerName = (pid: string) => playerNames[pid] ?? pid;

  // ── Waiting / GO Phase (full-screen interactive) ──────────
  if (phase === 'waiting') {
    // After clicking
    if (hasClicked) {
      const isFalseStart = myReactionTime !== null && myReactionTime < 0;

      return (
        <div
          className={`flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl transition-colors duration-200 ${
            isFalseStart
              ? 'bg-red-900/50 ring-2 ring-red-500/30'
              : 'bg-emerald-900/30 ring-2 ring-emerald-500/30'
          }`}
        >
          {isFalseStart ? (
            <>
              <span className="text-5xl">🚫</span>
              <p className="text-2xl font-bold text-red-400">Too Early!</p>
              <p className="text-sm text-white/50">Wait for the green screen next time</p>
            </>
          ) : (
            <>
              <span className="text-5xl">⚡</span>
              <p className="text-2xl font-bold text-emerald-400">
                {myReactionTime}ms
              </p>
              <p className="text-sm text-white/50">Waiting for others...</p>
            </>
          )}
        </div>
      );
    }

    // Active — WAIT or GO
    return (
      <div
        onClick={handleClick}
        className={`flex min-h-[400px] cursor-pointer select-none flex-col items-center justify-center gap-4 rounded-2xl transition-colors duration-100 ${
          visualGo
            ? 'bg-emerald-600 shadow-[0_0_60px_rgba(16,185,129,0.4)]'
            : 'bg-red-900/60 shadow-[0_0_40px_rgba(220,38,38,0.2)]'
        }`}
        role="button"
        tabIndex={0}
      >
        {visualGo ? (
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-6xl font-black tracking-wider text-white drop-shadow-lg">
              GO!
            </p>
            <p className="text-3xl font-bold tabular-nums text-white/90">
              {elapsedMs}ms
            </p>
            {!isSpectator && (
              <p className="text-sm text-white/60">Click or press Space!</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-5xl font-black tracking-widest text-red-300/80">
              WAIT...
            </p>
            {!isSpectator && (
              <p className="text-sm text-red-300/40">
                Don&apos;t click yet!
              </p>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // ── Result Phase ──────────────────────────────────────────
  if ((phase === 'result' || phase === 'finished') && lastResult) {
    const { winnerId, reactions: resultReactions } = lastResult;

    // Sort: valid times ascending, then false starts, then no reactions
    const sortedPlayers = [...players].sort((a, b) => {
      const ra = resultReactions[a];
      const rb = resultReactions[b];
      const aVal = typeof ra === 'number' ? ra : 99999;
      const bVal = typeof rb === 'number' ? rb : 99999;
      return aVal - bVal;
    });

    const isFinalRound =
      (gameMode === 'rounds' && round >= target) ||
      (gameMode === 'firstTo' && Math.max(...Object.values(scores)) >= target);

    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        <ScoreBoard
          players={players}
          scores={scores}
          playerNames={playerNames}
          myPlayerId={myPlayerId}
          highlightId={winnerId}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-white/40">
            Round {round} Results
          </h3>

          <div className="flex flex-col gap-2">
            {sortedPlayers.map((pid) => (
              <motion.div
                key={pid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sortedPlayers.indexOf(pid) * 0.1 }}
              >
                <ReactionDisplay
                  reaction={resultReactions[pid]}
                  playerName={getPlayerName(pid)}
                  isWinner={pid === winnerId}
                  isMe={pid === myPlayerId}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {winnerId ? (
          <p className="text-lg font-bold text-emerald-400">
            {winnerId === myPlayerId
              ? '🏆 You won this round!'
              : `🏆 ${getPlayerName(winnerId)} wins!`}
          </p>
        ) : (
          <p className="text-lg font-bold text-amber-400">
            No one scored this round
          </p>
        )}

        {isFinalRound ? (
          <p className="text-sm text-white/40">Final results incoming…</p>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className="text-lg font-semibold text-white/70">
              Next round in
            </p>
            <motion.span
              key={resultCountdown}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black tabular-nums text-emerald-400"
            >
              {resultCountdown}
            </motion.span>
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return null;
}
