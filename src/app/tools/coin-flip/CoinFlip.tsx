"use client";

// ============================================================
// ArcadeKit — Coin Flip (Client Component)
// 3D animated coin flip with statistics and Best-of-N mode.
// ============================================================

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleDot,
  RotateCcw,
  TrendingUp,
  Trophy,
  Flame,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

type CoinSide = "heads" | "tails";

interface FlipRecord {
  id: string;
  result: CoinSide;
  timestamp: Date;
}

interface BestOfState {
  target: number | null; // null = free play, 3/5/7 = best of N
  headsWins: number;
  tailsWins: number;
  complete: boolean;
  winner: CoinSide | null;
}

/* ── Component ──────────────────────────────────────────── */

export function CoinFlip() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentResult, setCurrentResult] = useState<CoinSide | null>(null);
  const [history, setHistory] = useState<FlipRecord[]>([]);
  const [bestOf, setBestOf] = useState<BestOfState>({
    target: null,
    headsWins: 0,
    tailsWins: 0,
    complete: false,
    winner: null,
  });
  const [flipRotation, setFlipRotation] = useState(0);
  const flipCounter = useRef(0);

  // Derived stats
  const totalFlips = history.length;
  const headsCount = history.filter((f) => f.result === "heads").length;
  const tailsCount = history.filter((f) => f.result === "tails").length;
  const headsPercent = totalFlips > 0 ? Math.round((headsCount / totalFlips) * 100) : 0;

  // Current streak
  let streak = 0;
  let streakType: CoinSide | null = null;
  if (history.length > 0) {
    streakType = history[0].result;
    for (const flip of history) {
      if (flip.result === streakType) streak++;
      else break;
    }
  }

  const doFlip = useCallback(() => {
    if (isFlipping || bestOf.complete) return;
    setIsFlipping(true);

    const result: CoinSide = Math.random() < 0.5 ? "heads" : "tails";

    // Compute the target rotation so the correct face is always showing.
    // Heads = 0° mod 360, Tails = 180° mod 360.
    // We add full spins (1800° = 5 turns) for the animation, then ensure
    // the final rotation mod 360 lands on the right face.
    const spins = 1800; // 5 full rotations for visual effect
    const targetFaceAngle = result === "tails" ? 180 : 0;
    setFlipRotation((prev) => {
      // Where we'd naturally end up after adding spins
      const rawTarget = prev + spins;
      // How far off the correct face are we?
      const currentFace = rawTarget % 360;
      // Adjust so we land exactly on the right face
      const correction = targetFaceAngle - currentFace;
      return rawTarget + correction;
    });

    setTimeout(() => {
      flipCounter.current += 1;
      const record: FlipRecord = {
        id: `flip-${flipCounter.current}-${Date.now()}`,
        result,
        timestamp: new Date(),
      };

      setCurrentResult(result);
      setHistory((prev) => [record, ...prev]);

      // Update best-of state
      if (bestOf.target) {
        const newHeads = bestOf.headsWins + (result === "heads" ? 1 : 0);
        const newTails = bestOf.tailsWins + (result === "tails" ? 1 : 0);
        const winsNeeded = Math.ceil(bestOf.target / 2);
        const complete = newHeads >= winsNeeded || newTails >= winsNeeded;
        const winner = complete
          ? newHeads >= winsNeeded
            ? ("heads" as CoinSide)
            : ("tails" as CoinSide)
          : null;

        setBestOf((prev) => ({
          ...prev,
          headsWins: newHeads,
          tailsWins: newTails,
          complete,
          winner,
        }));
      }

      setIsFlipping(false);
    }, 1000);
  }, [isFlipping, bestOf]);

  const resetAll = () => {
    setCurrentResult(null);
    setHistory([]);
    setFlipRotation(0);
    setBestOf({
      target: bestOf.target,
      headsWins: 0,
      tailsWins: 0,
      complete: false,
      winner: null,
    });
  };

  const setBestOfMode = (target: number | null) => {
    setBestOf({
      target,
      headsWins: 0,
      tailsWins: 0,
      complete: false,
      winner: null,
    });
    setHistory([]);
    setCurrentResult(null);
    setFlipRotation(0);
  };

  return (
    <section className="px-4 py-8 md:py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-ember/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* ── Header ──────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            <CircleDot className="h-4 w-4 text-ember" />
            Free Tool
          </div>
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Coin <span className="gradient-text">Flip</span>
          </h1>
          <p className="mt-2 text-text-secondary">
            Flip a coin with a stunning 3D animation. Track stats and streaks.
          </p>
        </div>

        {/* ── Best of N Mode ──────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mr-1">
            Mode:
          </span>
          {([null, 3, 5, 7] as (number | null)[]).map((n) => (
            <button
              key={n ?? "free"}
              onClick={() => setBestOfMode(n)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                bestOf.target === n
                  ? "border-ember/60 bg-ember/15 text-ember"
                  : "border-white/10 bg-surface text-text-secondary hover:border-white/20 hover:text-text-primary"
              }`}
            >
              {n === null ? "Free Play" : `Best of ${n}`}
            </button>
          ))}
        </div>

        {/* ── Best of N Progress ──────────────────────── */}
        <AnimatePresence>
          {bestOf.target && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-white/5 bg-surface p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="text-text-secondary">Heads</span>
                    <span className="font-heading font-bold text-text-primary">
                      {bestOf.headsWins}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted">
                    First to {Math.ceil(bestOf.target / 2)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-text-primary">
                      {bestOf.tailsWins}
                    </span>
                    <span className="text-text-secondary">Tails</span>
                    <div className="h-3 w-3 rounded-full bg-blue-400" />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-elevated">
                  <div
                    className="bg-amber-400 transition-all duration-500"
                    style={{
                      width: `${(bestOf.headsWins / Math.ceil(bestOf.target / 2)) * 50}%`,
                    }}
                  />
                  <div className="flex-1" />
                  <div
                    className="bg-blue-400 transition-all duration-500"
                    style={{
                      width: `${(bestOf.tailsWins / Math.ceil(bestOf.target / 2)) * 50}%`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Winner Banner ───────────────────────────── */}
        <AnimatePresence>
          {bestOf.complete && bestOf.winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-2xl border border-ember/30 bg-ember/10 p-4 text-center"
            >
              <Trophy className="mx-auto mb-2 h-8 w-8 text-ember" />
              <div className="font-heading text-xl font-bold text-ember">
                {bestOf.winner === "heads" ? "Heads" : "Tails"} Wins!
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                {bestOf.headsWins} – {bestOf.tailsWins}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Coin ────────────────────────────────────── */}
        <div className="flex justify-center" style={{ perspective: "1000px" }}>
          <motion.div
            className="relative h-48 w-48 cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateX: flipRotation }}
            transition={{
              duration: 1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            onClick={doFlip}
          >
            {/* Heads side */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-amber-400/60 bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <span className="font-heading text-4xl font-bold text-white">H</span>
                <div className="text-xs font-medium text-amber-200/80">HEADS</div>
              </div>
            </div>
            {/* Tails side */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-blue-400/60 bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
              }}
            >
              <div className="text-center">
                <span className="font-heading text-4xl font-bold text-white">T</span>
                <div className="text-xs font-medium text-blue-200/80">TAILS</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Result (fixed height to prevent layout shift) ── */}
        <div className="mt-6 flex min-h-[52px] items-center justify-center">
          <AnimatePresence mode="wait">
            {currentResult && !isFlipping && (
              <motion.div
                key={currentResult + history.length}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <span
                  className={`inline-block rounded-full px-6 py-2 font-heading text-2xl font-bold ${
                    currentResult === "heads"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-blue-500/15 text-blue-400"
                  }`}
                >
                  {currentResult === "heads" ? "Heads!" : "Tails!"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Flip Button ─────────────────────────────── */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <motion.button
            onClick={doFlip}
            disabled={isFlipping || bestOf.complete}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-ember px-10 py-4 text-lg font-bold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25 disabled:opacity-60"
          >
            <CircleDot className="h-5 w-5" />
            {isFlipping ? "Flipping..." : "Flip Coin"}
          </motion.button>
          <button
            onClick={resetAll}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-surface text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        {/* ── Statistics ──────────────────────────────── */}
        {totalFlips > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <div className="rounded-2xl border border-white/5 bg-surface p-4 text-center">
              <TrendingUp className="mx-auto mb-1 h-4 w-4 text-text-muted" />
              <div className="font-heading text-2xl font-bold text-text-primary">
                {totalFlips}
              </div>
              <div className="text-xs text-text-muted">Total Flips</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-surface p-4 text-center">
              <div
                className="mx-auto mb-1 h-4 w-4 rounded-full bg-amber-400"
                aria-hidden
              />
              <div className="font-heading text-2xl font-bold text-amber-400">
                {headsCount}
              </div>
              <div className="text-xs text-text-muted">
                Heads ({headsPercent}%)
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-surface p-4 text-center">
              <div
                className="mx-auto mb-1 h-4 w-4 rounded-full bg-blue-400"
                aria-hidden
              />
              <div className="font-heading text-2xl font-bold text-blue-400">
                {tailsCount}
              </div>
              <div className="text-xs text-text-muted">
                Tails ({100 - headsPercent}%)
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-surface p-4 text-center">
              <Flame className="mx-auto mb-1 h-4 w-4 text-ember" />
              <div className="font-heading text-2xl font-bold text-ember">
                {streak}
              </div>
              <div className="text-xs text-text-muted">
                {streakType ? `${streakType === "heads" ? "H" : "T"} Streak` : "Streak"}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Flip History ────────────────────────────── */}
        {history.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/5 bg-surface p-6">
            <div className="mb-3 text-sm font-semibold text-text-secondary">
              History
            </div>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 50).map((flip, idx) => (
                <motion.div
                  key={flip.id}
                  initial={idx === 0 ? { opacity: 0, scale: 0 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    flip.result === "heads"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-blue-500/15 text-blue-400"
                  }`}
                >
                  {flip.result === "heads" ? "H" : "T"}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
