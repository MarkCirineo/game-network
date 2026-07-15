"use client";

// ============================================================
// ArcadeKit — Score Keeper Client Component
// Track scores for any game with round history and localStorage
// persistence.
// ============================================================

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  Undo2,
  ArrowUpDown,
  UserPlus,
  Trophy,
  History,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY = "arcadekit-scorekeeper";
const MAX_PLAYERS = 12;

const PLAYER_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#22C55E", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#10B981", // emerald
  "#6366F1", // indigo
  "#F43F5E", // rose
  "#14B8A6", // teal
];

const INCREMENT_OPTIONS = [1, 2, 5, 10] as const;

// ── Types ────────────────────────────────────────────────────
interface Player {
  id: string;
  name: string;
  score: number;
  colorIndex: number;
}

interface ScoreAction {
  type: "add" | "subtract";
  playerId: string;
  amount: number;
  timestamp: number;
}

interface RoundSnapshot {
  round: number;
  scores: { playerId: string; name: string; score: number }[];
  timestamp: number;
}

interface GameState {
  players: Player[];
  history: ScoreAction[];
  rounds: RoundSnapshot[];
  currentRound: number;
}

// ── Helpers ──────────────────────────────────────────────────
function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function loadState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

const defaultPlayers: Player[] = [
  { id: createId(), name: "Player 1", score: 0, colorIndex: 0 },
  { id: createId(), name: "Player 2", score: 0, colorIndex: 1 },
];

// ── Main Component ───────────────────────────────────────────
export default function ScoreKeeper() {
  const [players, setPlayers] = useState<Player[]>(defaultPlayers);
  const [history, setHistory] = useState<ScoreAction[]>([]);
  const [rounds, setRounds] = useState<RoundSnapshot[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [increment, setIncrement] = useState(1);
  const [customIncrement, setCustomIncrement] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [sortByScore, setSortByScore] = useState(false);
  const [showRounds, setShowRounds] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const addPlayerInputRef = useRef<HTMLInputElement>(null);

  // ── Hydrate from localStorage ──────────────────────────────
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setPlayers(saved.players.length >= 2 ? saved.players : defaultPlayers);
      setHistory(saved.history ?? []);
      setRounds(saved.rounds ?? []);
      setCurrentRound(saved.currentRound ?? 1);
    }
    setHydrated(true);
  }, []);

  // ── Persist on changes ─────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    saveState({ players, history, rounds, currentRound });
  }, [players, history, rounds, currentRound, hydrated]);

  // ── Score modification ─────────────────────────────────────
  const adjustScore = useCallback(
    (playerId: string, amount: number, type: "add" | "subtract") => {
      const delta = type === "add" ? amount : -amount;
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId ? { ...p, score: p.score + delta } : p
        )
      );
      setHistory((prev) => [
        ...prev,
        { type, playerId, amount, timestamp: Date.now() },
      ]);
    },
    []
  );

  // ── Undo ───────────────────────────────────────────────────
  const undoLast = useCallback(() => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    const reverseDelta =
      lastAction.type === "add" ? -lastAction.amount : lastAction.amount;
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === lastAction.playerId
          ? { ...p, score: p.score + reverseDelta }
          : p
      )
    );
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  // ── Round management ───────────────────────────────────────
  const endRound = useCallback(() => {
    const snapshot: RoundSnapshot = {
      round: currentRound,
      scores: players.map((p) => ({
        playerId: p.id,
        name: p.name,
        score: p.score,
      })),
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, snapshot]);
    setCurrentRound((r) => r + 1);
  }, [currentRound, players]);

  // ── Player management ──────────────────────────────────────
  const addPlayer = () => {
    const name = newPlayerName.trim() || `Player ${players.length + 1}`;
    if (players.length >= MAX_PLAYERS) return;
    const nextColorIndex = players.length % PLAYER_COLORS.length;
    setPlayers((prev) => [
      ...prev,
      { id: createId(), name, score: 0, colorIndex: nextColorIndex },
    ]);
    setNewPlayerName("");
    addPlayerInputRef.current?.focus();
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setHistory((prev) => prev.filter((a) => a.playerId !== id));
  };

  // ── Reset ──────────────────────────────────────────────────
  const resetAll = () => {
    setPlayers(
      players.map((p) => ({ ...p, score: 0 }))
    );
    setHistory([]);
    setRounds([]);
    setCurrentRound(1);
    setShowResetConfirm(false);
  };

  // ── Derived data ───────────────────────────────────────────
  const displayedPlayers = useMemo(() => {
    if (!sortByScore) return players;
    return [...players].sort((a, b) => b.score - a.score);
  }, [players, sortByScore]);

  const totalScore = useMemo(
    () => players.reduce((sum, p) => sum + p.score, 0),
    [players]
  );

  const avgScore = useMemo(
    () => (players.length ? totalScore / players.length : 0),
    [totalScore, players.length]
  );

  const leader = useMemo(() => {
    if (!players.length) return null;
    const max = Math.max(...players.map((p) => p.score));
    if (max === 0) return null;
    const leaders = players.filter((p) => p.score === max);
    return leaders.length === 1 ? leaders[0] : null;
  }, [players]);

  const activeIncrement = showCustom
    ? parseInt(customIncrement, 10) || 1
    : increment;

  // ── Don't render until hydrated (avoids mismatch) ──────────
  if (!hydrated) {
    return (
      <section className="px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="h-8 w-8 rounded-full border-2 border-ember/30 border-t-ember"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        {/* ── Header ────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Score <span className="gradient-text">Keeper</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary md:text-base">
            Track scores for any game. Add players, adjust points, and
            view round-by-round history.
          </p>
        </div>

        {/* ── Controls Bar ──────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Round badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary">
            <Trophy className="h-3 w-3 text-ember" />
            Round {currentRound}
          </div>

          {/* Point increment selector */}
          <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-surface p-1">
            {INCREMENT_OPTIONS.map((val) => (
              <button
                key={val}
                onClick={() => {
                  setIncrement(val);
                  setShowCustom(false);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  !showCustom && increment === val
                    ? "bg-ember text-white shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                ±{val}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                showCustom
                  ? "bg-ember text-white shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              #
            </button>
          </div>

          {showCustom && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 64, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              value={customIncrement}
              onChange={(e) =>
                setCustomIncrement(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Amt"
              className="h-8 w-16 rounded-lg border border-white/10 bg-elevated px-2 text-center text-xs text-text-primary outline-none focus:border-ember/50"
            />
          )}

          <div className="flex-1" />

          {/* Sort toggle */}
          <button
            onClick={() => setSortByScore((s) => !s)}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors ${
              sortByScore
                ? "bg-ember/10 text-ember"
                : "text-text-muted hover:text-text-secondary"
            }`}
            title="Sort by score"
          >
            <ArrowUpDown className="h-3 w-3" />
            Sort
          </button>

          {/* Undo */}
          <button
            onClick={undoLast}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-text-muted transition-colors hover:text-text-secondary disabled:opacity-30"
            title="Undo last action"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </button>
        </div>

        {/* ── Player Cards ──────────────────────────────── */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {displayedPlayers.map((player) => (
              <motion.div
                key={player.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Accent left border */}
                <div
                  className="absolute bottom-0 left-0 top-0 w-1"
                  style={{
                    backgroundColor:
                      PLAYER_COLORS[player.colorIndex % PLAYER_COLORS.length],
                  }}
                />

                <div className="flex items-center gap-4 py-4 pl-5 pr-4">
                  {/* Player info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {leader?.id === player.id && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-base"
                        >
                          👑
                        </motion.span>
                      )}
                      <h3 className="truncate font-heading text-base font-bold text-text-primary">
                        {player.name}
                      </h3>
                    </div>
                  </div>

                  {/* Score controls */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() =>
                        adjustScore(player.id, activeIncrement, "subtract")
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-elevated text-text-secondary transition-colors hover:bg-red-500/20 hover:text-red-400 active:scale-95"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus className="h-4 w-4" />
                    </motion.button>

                    <motion.div
                      key={player.score}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="w-16 text-center font-heading text-2xl font-bold tabular-nums text-text-primary"
                    >
                      {player.score}
                    </motion.div>

                    <motion.button
                      onClick={() =>
                        adjustScore(player.id, activeIncrement, "add")
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-elevated text-text-secondary transition-colors hover:bg-emerald-500/20 hover:text-emerald-400 active:scale-95"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {/* Remove player */}
                  <button
                    onClick={() => removePlayer(player.id)}
                    disabled={players.length <= 2}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
                    title="Remove player"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Add Player ────────────────────────────────── */}
        {players.length < MAX_PLAYERS && (
          <div className="mt-4 flex items-center gap-2">
            <input
              ref={addPlayerInputRef}
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addPlayer();
              }}
              placeholder="Player name…"
              className="min-w-0 flex-1 rounded-xl border border-white/5 bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-ember/50 focus:ring-1 focus:ring-ember/30"
              maxLength={24}
            />
            <motion.button
              onClick={addPlayer}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-ember px-4 text-sm font-semibold text-white transition-colors hover:bg-ember/90"
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="h-4 w-4" />
              Add
            </motion.button>
          </div>
        )}

        {/* ── Stats Bar ─────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: totalScore },
            { label: "Average", value: avgScore.toFixed(1) },
            { label: "Players", value: players.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-surface px-4 py-3 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {stat.label}
              </p>
              <p className="mt-1 font-heading text-lg font-bold tabular-nums text-text-primary">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Action Buttons ────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <motion.button
            onClick={endRound}
            className="inline-flex items-center gap-1.5 rounded-xl bg-elevated px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-elevated/80"
            whileTap={{ scale: 0.95 }}
          >
            <Trophy className="h-4 w-4 text-ember" />
            End Round
          </motion.button>

          <button
            onClick={() => setShowRounds((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-white/10 hover:text-text-primary"
          >
            <History className="h-4 w-4" />
            Rounds ({rounds.length})
            {showRounds ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 px-4 py-2.5 text-sm font-semibold text-red-400/70 transition-colors hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        {/* ── Reset Confirmation Modal ──────────────────── */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
            >
              <motion.div
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="font-heading text-lg font-bold">
                    Reset All Scores?
                  </h3>
                </div>
                <p className="mb-6 text-sm text-text-secondary">
                  This will reset all scores to zero and clear round history.
                  Players will be kept.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Reset Scores
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Round History ──────────────────────────────── */}
        <AnimatePresence>
          {showRounds && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              {rounds.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-surface p-6 text-center">
                  <p className="text-sm text-text-muted">
                    No rounds recorded yet. Click &ldquo;End Round&rdquo; to
                    save a snapshot.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rounds.map((round) => (
                    <div
                      key={round.round}
                      className="rounded-2xl border border-white/5 bg-surface p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-heading text-sm font-bold text-text-primary">
                          Round {round.round}
                        </h4>
                        <span className="text-xs text-text-muted">
                          {new Date(round.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {[...round.scores]
                          .sort((a, b) => b.score - a.score)
                          .map((s, i) => (
                            <div
                              key={s.playerId}
                              className="flex items-center gap-2 rounded-lg bg-elevated/60 px-3 py-1.5"
                            >
                              {i === 0 && <span className="text-xs">🏆</span>}
                              <span className="text-xs font-semibold text-text-secondary">
                                {s.name}
                              </span>
                              <span className="font-heading text-sm font-bold tabular-nums text-text-primary">
                                {s.score}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
