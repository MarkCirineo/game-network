// ============================================================
// ArcadeKit — Game Over Screen
// End-of-game screen with winner announcement, scores, confetti,
// and rematch/back-to-games actions.
// ============================================================

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RotateCcw, ArrowLeft, Trophy } from "lucide-react";
import type { GameStatus, PlayerInfo } from "../../../shared/messages";

interface GameOverProps {
  result: GameStatus;
  players: PlayerInfo[];
  myPlayerId: string | null;
  isSpectator: boolean;
  onRematch: () => void;
  onBackToGames: () => void;
  rematchRequests: Set<string>;
}

// Confetti colors matching the ArcadeKit palette
const CONFETTI_COLORS = [
  "#7C3AED", // violet
  "#06D6A0", // cyan
  "#F472B6", // pink
  "#F59E0B", // amber
  "#3B82F6", // blue
  "#EF4444", // coral
];

function ConfettiParticles() {
  // Generate deterministic-ish particles using index-based values
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        left: `${(i * 17 + 5) % 100}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${(i * 0.12).toFixed(2)}s`,
        duration: `${1.2 + (i % 5) * 0.3}s`,
        size: i % 3 === 0 ? 6 : 4,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: i % 2 === 0 ? "50%" : "1px",
            animation: `confetti ${p.duration} ease-out ${p.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function GameOver({
  result,
  players,
  myPlayerId,
  isSpectator,
  onRematch,
  onBackToGames,
  rematchRequests,
}: GameOverProps) {
  const isDraw = result.winnerId === null;
  const winner = result.winnerId
    ? players.find((p) => p.id === result.winnerId)
    : null;
  const isMyWin =
    !isSpectator && myPlayerId != null && result.winnerId === myPlayerId;

  // Scores sorted descending
  const sortedScores = useMemo(() => {
    if (!result.scores) return null;
    return Object.entries(result.scores)
      .map(([playerId, score]) => ({
        player: players.find((p) => p.id === playerId),
        playerId,
        score,
      }))
      .sort((a, b) => b.score - a.score);
  }, [result.scores, players]);

  const hasRequestedRematch = myPlayerId
    ? rematchRequests.has(myPlayerId)
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-white/5 bg-surface p-8 shadow-2xl"
    >
      {/* Confetti for the winner */}
      {isMyWin && <ConfettiParticles />}

      {/* Trophy / Result icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
      >
        {isDraw ? (
          <span className="text-5xl">🤝</span>
        ) : (
          <span className="text-5xl">🏆</span>
        )}
      </motion.div>

      {/* Winner / Draw announcement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-center"
      >
        {isDraw ? (
          <h2 className="text-2xl font-bold text-foreground">It&apos;s a Draw!</h2>
        ) : isMyWin ? (
          <h2 className="text-2xl font-bold text-foreground">
            You Win! <span className="ml-1">🎉</span>
          </h2>
        ) : (
          <h2 className="text-2xl font-bold text-foreground">
            {winner?.name ?? "Unknown"} Wins!
          </h2>
        )}
        {result.reason && (
          <p className="mt-1 text-sm text-text-secondary">{result.reason}</p>
        )}
      </motion.div>

      {/* Scores leaderboard */}
      {sortedScores && sortedScores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full rounded-lg border border-white/5 bg-elevated/50 p-3"
        >
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Scores
          </h3>
          <div className="flex flex-col gap-1.5">
            {sortedScores.map(({ player, playerId, score }, idx) => (
              <div
                key={playerId}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm",
                  idx === 0 && "bg-violet/10"
                )}
              >
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <Trophy className="h-3.5 w-3.5 text-amber" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      idx === 0 ? "text-foreground" : "text-text-secondary"
                    )}
                  >
                    {player?.name ?? playerId}
                  </span>
                  {playerId === myPlayerId && (
                    <span className="text-[10px] text-text-muted">(You)</span>
                  )}
                </div>
                <span className="tabular-nums font-semibold text-foreground">
                  {score}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex w-full flex-col gap-2.5"
      >
        {!isSpectator && (
          <button
            onClick={onRematch}
            disabled={hasRequestedRematch}
            className={cn(
              "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all active:translate-y-px",
              hasRequestedRematch
                ? "bg-violet/15 text-violet ring-1 ring-violet/30"
                : "bg-violet text-white shadow-lg shadow-violet/25 hover:bg-violet/90"
            )}
          >
            <RotateCcw className="h-4 w-4" />
            {hasRequestedRematch
              ? `Rematch Requested (${rematchRequests.size}/${players.length})`
              : `Play Again (${rematchRequests.size}/${players.length})`}
          </button>
        )}

        <button
          onClick={onBackToGames}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/5 px-5 py-3 text-sm font-medium text-text-secondary transition-all hover:bg-white/10 hover:text-foreground active:translate-y-px"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </button>
      </motion.div>
    </motion.div>
  );
}
