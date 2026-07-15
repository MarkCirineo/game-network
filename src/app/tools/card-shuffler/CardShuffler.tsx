"use client";

// ============================================================
// ArcadeKit — Card Shuffler (Client Component)
// Visual 52-card deck with shuffle, draw, and flip animations.
// ============================================================

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  RotateCcw,
  ChevronDown,
  Layers,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────── */
type Suit = "♠" | "♥" | "♦" | "♣";
type JokerType = "🃏";

interface PlayingCard {
  id: string;
  suit: Suit | JokerType;
  value: string;
  display: string;
  isRed: boolean;
  isJoker: boolean;
}

/* ── Deck creation ────────────────────────────────────────── */
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck(includeJokers: boolean): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      const isRed = suit === "♥" || suit === "♦";
      deck.push({
        id: `${value}${suit}`,
        suit,
        value,
        display: `${value}${suit}`,
        isRed,
        isJoker: false,
      });
    }
  }
  if (includeJokers) {
    deck.push({
      id: "joker-1",
      suit: "🃏",
      value: "★",
      display: "🃏",
      isRed: true,
      isJoker: true,
    });
    deck.push({
      id: "joker-2",
      suit: "🃏",
      value: "★",
      display: "🃏",
      isRed: false,
      isJoker: true,
    });
  }
  return deck;
}

/* ── Fisher–Yates shuffle ────────────────────────────────── */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Draw amount options ─────────────────────────────────── */
const DRAW_OPTIONS = [1, 3, 5, 7];

export function CardShuffler() {
  const [includeJokers, setIncludeJokers] = useState(false);
  const [deck, setDeck] = useState<PlayingCard[]>(() =>
    shuffleArray(createDeck(false))
  );
  const [hand, setHand] = useState<PlayingCard[]>([]);
  const [drawCount, setDrawCount] = useState(1);
  const [customDraw, setCustomDraw] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);
  const [showDrawMenu, setShowDrawMenu] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const remaining = deck.length;
  const totalCards = includeJokers ? 54 : 52;

  /* ── Shuffle deck ──────────────────────────────────────── */
  const handleShuffle = useCallback(async () => {
    setIsShuffling(true);
    setHand([]);
    setRevealedIds(new Set());

    // Brief animation delay
    await new Promise((r) => setTimeout(r, 700));

    setDeck(shuffleArray(createDeck(includeJokers)));
    setIsShuffling(false);
  }, [includeJokers]);

  /* ── Draw cards ────────────────────────────────────────── */
  const handleDraw = useCallback(
    (count: number) => {
      const actual = Math.min(count, deck.length);
      if (actual === 0) return;

      const drawn = deck.slice(0, actual);
      setDeck((prev) => prev.slice(actual));
      setHand((prev) => [...prev, ...drawn]);

      // Stagger reveal animation
      drawn.forEach((card, i) => {
        setTimeout(() => {
          setRevealedIds((prev) => new Set(prev).add(card.id));
        }, 150 + i * 200);
      });

      setShowDrawMenu(false);
    },
    [deck]
  );

  /* ── Reset ─────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    setDeck(shuffleArray(createDeck(includeJokers)));
    setHand([]);
    setRevealedIds(new Set());
  }, [includeJokers]);

  /* ── Toggle jokers ─────────────────────────────────────── */
  const toggleJokers = useCallback(() => {
    const next = !includeJokers;
    setIncludeJokers(next);
    setDeck(shuffleArray(createDeck(next)));
    setHand([]);
    setRevealedIds(new Set());
  }, [includeJokers]);

  /* ── Effective draw count ──────────────────────────────── */
  const effectiveDrawCount = useMemo(() => {
    const custom = parseInt(customDraw, 10);
    return custom > 0 ? custom : drawCount;
  }, [customDraw, drawCount]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Controls ────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            className="flex h-11 items-center gap-2 rounded-xl bg-ember px-5 text-sm font-semibold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25 disabled:opacity-50"
          >
            {isShuffling ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
              >
                <Shuffle className="h-4 w-4" />
              </motion.div>
            ) : (
              <Shuffle className="h-4 w-4" />
            )}
            {isShuffling ? "Shuffling…" : "Shuffle"}
          </button>

          {/* Draw button with dropdown */}
          <div className="relative">
            <div className="flex">
              <button
                onClick={() => handleDraw(effectiveDrawCount)}
                disabled={remaining === 0}
                className="flex h-11 items-center gap-2 rounded-l-xl border border-white/10 bg-elevated px-4 text-sm font-medium text-text-primary transition-colors hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Layers className="h-4 w-4 text-text-muted" />
                Draw {effectiveDrawCount}
              </button>
              <button
                onClick={() => setShowDrawMenu((v) => !v)}
                className="flex h-11 items-center rounded-r-xl border border-l-0 border-white/10 bg-elevated px-2 text-text-muted transition-colors hover:border-white/20 hover:text-text-primary"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Draw dropdown */}
            <AnimatePresence>
              {showDrawMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-white/10 bg-elevated p-2 shadow-2xl"
                >
                  {DRAW_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setDrawCount(n);
                        setCustomDraw("");
                        setShowDrawMenu(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        drawCount === n && !customDraw
                          ? "bg-ember/15 text-ember"
                          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                      }`}
                    >
                      Draw {n} card{n > 1 ? "s" : ""}
                    </button>
                  ))}
                  <div className="mt-1 border-t border-white/5 pt-1">
                    <input
                      type="number"
                      min="1"
                      max={remaining}
                      value={customDraw}
                      onChange={(e) => setCustomDraw(e.target.value)}
                      placeholder="Custom…"
                      className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-elevated px-4 text-sm font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          {/* Joker toggle */}
          <label className="ml-auto flex cursor-pointer items-center gap-2">
            <span className="text-sm text-text-secondary">Jokers</span>
            <button
              role="switch"
              aria-checked={includeJokers}
              onClick={toggleJokers}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                includeJokers ? "bg-ember" : "bg-elevated border border-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  includeJokers ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </div>

        {/* Remaining count */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
            <motion.div
              className="h-full rounded-full bg-ember/60"
              initial={false}
              animate={{ width: `${(remaining / totalCards) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="min-w-[4.5rem] text-right text-xs text-text-muted">
            {remaining} / {totalCards}
          </span>
        </div>
      </div>

      {/* ── Deck Display (Remaining) ────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-surface p-5">
        <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
          Deck ({remaining} remaining)
        </h2>

        {isShuffling ? (
          <div className="flex h-28 items-center justify-center">
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-16 w-11 rounded-lg border border-ember/30 bg-ember/10"
                  animate={{
                    y: [0, -20, 0, 10, 0],
                    rotate: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 30, 0],
                    x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.05,
                    repeat: 1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        ) : remaining > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {deck.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-12 w-9 items-center justify-center rounded-md border border-white/10 bg-elevated text-[10px] font-bold"
              >
                {/* Card backs — just show a pattern */}
                <div className="flex h-10 w-7 items-center justify-center rounded-sm bg-gradient-to-br from-ember/20 to-violet-500/20 border border-white/5">
                  <span className="text-[8px] text-white/30">✦</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-text-muted">
            All cards drawn. Hit Reset to start over.
          </p>
        )}
      </div>

      {/* ── Hand Display ────────────────────────────────── */}
      <AnimatePresence>
        {hand.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/5 bg-surface p-5"
          >
            <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
              Your Hand ({hand.length} card{hand.length !== 1 && "s"})
            </h2>
            <div className="flex flex-wrap gap-2">
              {hand.map((card) => {
                const isRevealed = revealedIds.has(card.id);
                return (
                  <div key={card.id} className="perspective-[600px]">
                    <motion.div
                      className="relative h-[5.5rem] w-[3.75rem]"
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: isRevealed ? 0 : 180 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Front face */}
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-between rounded-lg border p-1.5 ${
                          card.isJoker
                            ? "border-amber-500/30 bg-amber-500/10"
                            : card.isRed
                              ? "border-rose-500/30 bg-white/[0.03]"
                              : "border-white/15 bg-white/[0.03]"
                        }`}
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <span
                          className={`self-start text-[11px] font-bold leading-none ${
                            card.isJoker
                              ? "text-amber-400"
                              : card.isRed
                                ? "text-rose-400"
                                : "text-white"
                          }`}
                        >
                          {card.value}
                        </span>
                        <span
                          className={`text-xl leading-none ${
                            card.isJoker
                              ? "text-amber-400"
                              : card.isRed
                                ? "text-rose-400"
                                : "text-white/80"
                          }`}
                        >
                          {card.suit}
                        </span>
                        <span
                          className={`self-end rotate-180 text-[11px] font-bold leading-none ${
                            card.isJoker
                              ? "text-amber-400"
                              : card.isRed
                                ? "text-rose-400"
                                : "text-white"
                          }`}
                        >
                          {card.value}
                        </span>
                      </div>

                      {/* Back face */}
                      <div
                        className="absolute inset-0 flex items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-ember/20 to-violet-500/20"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <span className="text-lg text-white/20">✦</span>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
