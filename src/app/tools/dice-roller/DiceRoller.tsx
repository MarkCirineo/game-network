"use client";

// ============================================================
// ArcadeKit — Dice Roller (Client Component)
// Interactive dice roller with presets, modifiers, and history.
// ============================================================

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dices,
  Plus,
  Minus,
  RotateCcw,
  History,
  Sparkles,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface RollResult {
  id: string;
  dice: number[];
  dieType: DieType;
  numDice: number;
  modifier: number;
  total: number;
  label: string;
  timestamp: Date;
  dropped?: number[];
}

/* ── Constants ──────────────────────────────────────────── */

const DIE_TYPES: DieType[] = [4, 6, 8, 10, 12, 20, 100];

const PRESETS = [
  { label: "1d20", numDice: 1, dieType: 20 as DieType, modifier: 0, special: null },
  { label: "2d6", numDice: 2, dieType: 6 as DieType, modifier: 0, special: null },
  { label: "1d100", numDice: 1, dieType: 100 as DieType, modifier: 0, special: null },
  { label: "4d6 drop low", numDice: 4, dieType: 6 as DieType, modifier: 0, special: "drop-lowest" as const },
  { label: "2d20 adv", numDice: 2, dieType: 20 as DieType, modifier: 0, special: "advantage" as const },
  { label: "2d20 dis", numDice: 2, dieType: 20 as DieType, modifier: 0, special: "disadvantage" as const },
];

/* ── Helpers ────────────────────────────────────────────── */

function rollDie(sides: DieType): number {
  return Math.floor(Math.random() * sides) + 1;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* ── Component ──────────────────────────────────────────── */

export function DiceRoller() {
  const [numDice, setNumDice] = useState(1);
  const [dieType, setDieType] = useState<DieType>(20);
  const [modifier, setModifier] = useState(0);
  const [currentRoll, setCurrentRoll] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const rollCounter = useRef(0);

  const doRoll = useCallback(
    (
      nd: number,
      dt: DieType,
      mod: number,
      special: string | null = null
    ) => {
      if (isRolling) return;
      setIsRolling(true);

      // Animate for 600ms then reveal result
      setTimeout(() => {
        const dice = Array.from({ length: nd }, () => rollDie(dt));
        let total: number;
        let label: string;
        let dropped: number[] | undefined;

        if (special === "drop-lowest" && nd > 1) {
          const sorted = [...dice].sort((a, b) => a - b);
          dropped = [sorted[0]];
          const kept = sorted.slice(1);
          total = kept.reduce((s, v) => s + v, 0) + mod;
          label = `${nd}d${dt} drop lowest${mod ? ` ${mod >= 0 ? "+" : ""}${mod}` : ""}`;
        } else if (special === "advantage" && nd === 2) {
          total = Math.max(dice[0], dice[1]) + mod;
          dropped = [Math.min(dice[0], dice[1])];
          label = `2d${dt} advantage${mod ? ` ${mod >= 0 ? "+" : ""}${mod}` : ""}`;
        } else if (special === "disadvantage" && nd === 2) {
          total = Math.min(dice[0], dice[1]) + mod;
          dropped = [Math.max(dice[0], dice[1])];
          label = `2d${dt} disadvantage${mod ? ` ${mod >= 0 ? "+" : ""}${mod}` : ""}`;
        } else {
          total = dice.reduce((s, v) => s + v, 0) + mod;
          label = `${nd}d${dt}${mod ? ` ${mod >= 0 ? "+" : ""}${mod}` : ""}`;
        }

        rollCounter.current += 1;
        const result: RollResult = {
          id: `roll-${rollCounter.current}-${Date.now()}`,
          dice,
          dieType: dt,
          numDice: nd,
          modifier: mod,
          total,
          label,
          timestamp: new Date(),
          dropped,
        };

        setCurrentRoll(result);
        setHistory((prev) => [result, ...prev].slice(0, 10));
        setIsRolling(false);
      }, 600);
    },
    [isRolling]
  );

  const handleRoll = () => doRoll(numDice, dieType, modifier);

  const handlePreset = (preset: (typeof PRESETS)[number]) =>
    doRoll(preset.numDice, preset.dieType, preset.modifier, preset.special);

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
            <Dices className="h-4 w-4 text-ember" />
            Free Tool
          </div>
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Dice <span className="gradient-text">Roller</span>
          </h1>
          <p className="mt-2 text-text-secondary">
            Roll any dice, add modifiers, and track your history.
          </p>
        </div>

        {/* ── Quick Presets ────────────────────────────── */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              disabled={isRolling}
              className="rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-all hover:border-ember/40 hover:text-ember disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Controls Card ───────────────────────────── */}
        <div className="rounded-2xl border border-white/5 bg-surface p-6">
          {/* Die configuration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Number of dice */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Number of Dice
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNumDice(Math.max(1, numDice - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-elevated text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center font-heading text-2xl font-bold">
                  {numDice}
                </span>
                <button
                  onClick={() => setNumDice(Math.min(10, numDice + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-elevated text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Die type */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Die Type
              </label>
              <div className="grid grid-cols-4 gap-1 sm:grid-cols-4">
                {DIE_TYPES.map((dt) => (
                  <button
                    key={dt}
                    onClick={() => setDieType(dt)}
                    className={`rounded-lg border px-2 py-2 text-sm font-bold transition-all ${
                      dieType === dt
                        ? "border-ember/60 bg-ember/15 text-ember"
                        : "border-white/10 bg-elevated text-text-secondary hover:border-white/20 hover:text-text-primary"
                    }`}
                  >
                    d{dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Modifier */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Modifier
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModifier(modifier - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-elevated text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  className={`flex-1 text-center font-heading text-2xl font-bold ${
                    modifier > 0
                      ? "text-green-400"
                      : modifier < 0
                        ? "text-red-400"
                        : "text-text-secondary"
                  }`}
                >
                  {modifier >= 0 ? `+${modifier}` : modifier}
                </span>
                <button
                  onClick={() => setModifier(modifier + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-elevated text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Roll button */}
          <motion.button
            onClick={handleRoll}
            disabled={isRolling}
            whileTap={{ scale: 0.95 }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ember py-4 text-lg font-bold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25 disabled:opacity-60"
          >
            <motion.div
              animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
                repeat: isRolling ? Infinity : 0,
              }}
            >
              <Dices className="h-6 w-6" />
            </motion.div>
            {isRolling ? "Rolling..." : `Roll ${numDice}d${dieType}${modifier ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""}`}
          </motion.button>
        </div>

        {/* ── Result Display ──────────────────────────── */}
        <AnimatePresence mode="wait">
          {currentRoll && (
            <motion.div
              key={currentRoll.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-2xl border border-white/5 bg-surface p-6"
            >
              {/* Label */}
              <div className="mb-3 text-center text-sm font-medium text-text-muted">
                {currentRoll.label}
              </div>

              {/* Individual dice */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {currentRoll.dice.map((value, i) => {
                  const isDropped = currentRoll.dropped?.includes(value) &&
                    currentRoll.dropped.indexOf(value) ===
                      currentRoll.dice.indexOf(value, 0) &&
                      i === currentRoll.dice.indexOf(value);
                  // More robust: check if this specific index is a dropped one
                  const droppedIndices: number[] = [];
                  if (currentRoll.dropped) {
                    const sorted = [...currentRoll.dice]
                      .map((v, idx) => ({ v, idx }))
                      .sort((a, b) => a.v - b.v);
                    for (let d = 0; d < currentRoll.dropped.length; d++) {
                      droppedIndices.push(sorted[d].idx);
                    }
                  }
                  const isThisDropped = droppedIndices.includes(i);

                  const isNat20 =
                    currentRoll.dieType === 20 && value === 20;
                  const isNat1 =
                    currentRoll.dieType === 20 && value === 1;

                  return (
                    <motion.div
                      key={`die-${i}`}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{
                        delay: i * 0.08,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className={`relative flex h-16 w-16 items-center justify-center rounded-xl border text-xl font-bold ${
                        isThisDropped
                          ? "border-white/5 bg-elevated/50 text-text-muted line-through opacity-50"
                          : isNat20
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 glow-cyan"
                            : isNat1
                              ? "border-red-500/40 bg-red-500/10 text-red-400"
                              : "border-white/10 bg-elevated text-text-primary"
                      }`}
                    >
                      {value}
                      {isNat20 && (
                        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-emerald-400" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Modifier display */}
              {currentRoll.modifier !== 0 && (
                <div className="mt-3 text-center text-sm text-text-muted">
                  {currentRoll.modifier > 0 ? "+" : ""}
                  {currentRoll.modifier} modifier
                </div>
              )}

              {/* Total */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mt-4 text-center"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Total
                </span>
                <div className="font-heading text-5xl font-bold gradient-text">
                  {currentRoll.total}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Roll History ────────────────────────────── */}
        {history.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/5 bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <History className="h-4 w-4" />
                Roll History
              </div>
              <button
                onClick={() => {
                  setHistory([]);
                  setCurrentRoll(null);
                }}
                className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {history.map((roll, idx) => (
                <motion.div
                  key={roll.id}
                  initial={idx === 0 ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    idx === 0
                      ? "border border-ember/20 bg-ember/5"
                      : "bg-elevated/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted">
                      {formatTime(roll.timestamp)}
                    </span>
                    <span className="font-medium text-text-secondary">
                      {roll.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      [{roll.dice.join(", ")}]
                    </span>
                    <span className="font-heading font-bold text-text-primary">
                      = {roll.total}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
