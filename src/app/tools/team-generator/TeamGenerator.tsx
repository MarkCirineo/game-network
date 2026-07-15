"use client";

// ============================================================
// ArcadeKit — Team Generator (Client Component)
// Interactive team randomizer with shuffle animations.
// ============================================================

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Shuffle,
  Copy,
  Check,
  Users,
  Minus,
  RotateCcw,
  Share2,
} from "lucide-react";

/* ── Team color palette ─────────────────────────────────── */
const TEAM_COLORS = [
  { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400", label: "Blue" },
  { bg: "bg-rose-500/15", border: "border-rose-500/30", text: "text-rose-400", dot: "bg-rose-400", label: "Rose" },
  { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400", label: "Emerald" },
  { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400", label: "Amber" },
  { bg: "bg-violet-500/15", border: "border-violet-500/30", text: "text-violet-400", dot: "bg-violet-400", label: "Violet" },
  { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-400", dot: "bg-cyan-400", label: "Cyan" },
  { bg: "bg-pink-500/15", border: "border-pink-500/30", text: "text-pink-400", dot: "bg-pink-400", label: "Pink" },
  { bg: "bg-teal-500/15", border: "border-teal-500/30", text: "text-teal-400", dot: "bg-teal-400", label: "Teal" },
];

/* ── Fisher–Yates shuffle ────────────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TeamGenerator() {
  const [players, setPlayers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Add player ────────────────────────────────────────── */
  const addPlayer = useCallback(() => {
    const name = inputValue.trim();
    if (!name || players.includes(name)) return;
    setPlayers((prev) => [...prev, name]);
    setInputValue("");
    setTeams(null);
    inputRef.current?.focus();
  }, [inputValue, players]);

  /* ── Remove player ─────────────────────────────────────── */
  const removePlayer = useCallback((name: string) => {
    setPlayers((prev) => prev.filter((p) => p !== name));
    setTeams(null);
  }, []);

  /* ── Generate teams with animation ─────────────────────── */
  const generateTeams = useCallback(async () => {
    if (players.length < teamCount) return;
    setIsShuffling(true);
    setTeams(null);

    // Simulate shuffle visual delay
    await new Promise((r) => setTimeout(r, 800));

    const shuffled = shuffle(players);
    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((player, i) => {
      result[i % teamCount].push(player);
    });

    setTeams(result);
    setIsShuffling(false);
  }, [players, teamCount]);

  /* ── Copy results to clipboard ─────────────────────────── */
  const copyResults = useCallback(async () => {
    if (!teams) return;
    const text = teams
      .map(
        (team, i) =>
          `Team ${i + 1} (${TEAM_COLORS[i % TEAM_COLORS.length].label}):\n${team.map((p) => `  • ${p}`).join("\n")}`
      )
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [teams]);

  /* ── Share formatted text ──────────────────────────────── */
  const shareResults = useCallback(async () => {
    if (!teams) return;
    const text = teams
      .map(
        (team, i) =>
          `🏷️ Team ${i + 1}: ${team.join(", ")}`
      )
      .join("\n");
    const shareText = `🎲 Random Teams\n\n${text}\n\nGenerated at arcadekit.games/tools/team-generator`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [teams]);

  /* ── Reset all ─────────────────────────────────────────── */
  const resetAll = useCallback(() => {
    setPlayers([]);
    setTeams(null);
    setInputValue("");
    setTeamCount(2);
    inputRef.current?.focus();
  }, []);

  const canGenerate = players.length >= teamCount && players.length >= 2;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Input Area ──────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-surface p-6">
        <label className="mb-3 block text-sm font-medium text-text-secondary">
          Add Players
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPlayer();
              }
            }}
            placeholder="Enter a player name…"
            className="flex-1 rounded-xl border border-white/10 bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-ember/50 focus:ring-1 focus:ring-ember/25"
          />
          <button
            onClick={addPlayer}
            disabled={!inputValue.trim()}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-ember text-white transition-all hover:bg-ember/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Player Tags */}
        <AnimatePresence mode="popLayout">
          {players.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {players.map((player) => (
                <motion.span
                  key={player}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-elevated px-3 py-1.5 text-sm text-text-primary"
                >
                  {player}
                  <button
                    onClick={() => removePlayer(player)}
                    className="ml-0.5 rounded-full p-0.5 text-text-muted transition-colors hover:bg-white/10 hover:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {players.length > 0 && (
          <p className="mt-3 text-xs text-text-muted">
            {players.length} player{players.length !== 1 && "s"} added
          </p>
        )}
      </div>

      {/* ── Settings & Generate ─────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Team count selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              Number of Teams
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTeamCount((c) => Math.max(2, c - 1))}
                disabled={teamCount <= 2}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-elevated text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-14 items-center justify-center rounded-lg border border-white/10 bg-elevated font-heading text-lg font-bold text-text-primary">
                {teamCount}
              </span>
              <button
                onClick={() => setTeamCount((c) => Math.min(8, c + 1))}
                disabled={teamCount >= 8}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-elevated text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {teams && (
              <button
                onClick={resetAll}
                className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-elevated px-4 text-sm font-medium text-text-secondary transition-all hover:border-white/20 hover:text-text-primary"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
            <button
              onClick={generateTeams}
              disabled={!canGenerate || isShuffling}
              className="relative flex h-11 items-center gap-2 rounded-xl bg-ember px-6 text-sm font-semibold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isShuffling ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                  >
                    <Shuffle className="h-4 w-4" />
                  </motion.div>
                  Shuffling…
                </>
              ) : teams ? (
                <>
                  <Shuffle className="h-4 w-4" />
                  Shuffle Again
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Generate Teams
                </>
              )}
            </button>
          </div>
        </div>

        {!canGenerate && players.length > 0 && (
          <p className="mt-3 text-xs text-amber-400/80">
            Need at least {teamCount} players to make {teamCount} teams.
          </p>
        )}
      </div>

      {/* ── Shuffle Animation Overlay ───────────────────── */}
      <AnimatePresence>
        {isShuffling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-8"
          >
            <div className="flex flex-wrap justify-center gap-2">
              {players.map((player, i) => (
                <motion.div
                  key={player}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 80, 0],
                    y: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, 0],
                    rotate: [0, (Math.random() - 0.5) * 30, 0],
                    scale: [1, 1.1, 0.95, 1],
                  }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.03,
                    ease: "easeInOut",
                  }}
                  className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-1.5 text-sm font-medium text-ember"
                >
                  {player}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ─────────────────────────────────────── */}
      <AnimatePresence>
        {teams && !isShuffling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Action bar */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                Results
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyResults}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-elevated px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-white/20 hover:text-text-primary"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={shareResults}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-elevated px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-white/20 hover:text-text-primary"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              </div>
            </div>

            {/* Team cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {teams.map((team, i) => {
                const color = TEAM_COLORS[i % TEAM_COLORS.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.35 }}
                    className={`rounded-2xl border ${color.border} ${color.bg} p-5`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
                      <h3 className={`font-heading text-sm font-bold ${color.text}`}>
                        Team {i + 1}
                      </h3>
                      <span className="ml-auto text-xs text-text-muted">
                        {team.length} player{team.length !== 1 && "s"}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {team.map((player, j) => (
                        <motion.li
                          key={player}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 + j * 0.06 }}
                          className="flex items-center gap-2 text-sm text-text-primary"
                        >
                          <span className="text-text-muted">
                            {j + 1}.
                          </span>
                          {player}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
