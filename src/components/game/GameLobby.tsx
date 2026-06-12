// ============================================================
// ArcadeKit — Game Lobby
// Lobby screen shown while waiting for players to join and ready up.
// ============================================================

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { gameRegistry } from "@/games/registry";
import { InvitePanel } from "./InvitePanel";
import { PlayerList } from "./PlayerList";
import { Users, Play, CheckCircle2 } from "lucide-react";
import type { PlayerInfo, SpectatorInfo } from "../../../shared/messages";

interface GameLobbyProps {
  roomCode: string;
  gameId: string;
  players: PlayerInfo[];
  spectators: SpectatorInfo[];
  myPlayerId: string | null;
  hostId: string | null;
  minPlayers: number;
  maxPlayers: number;
  onReady: () => void;
  onStartGame: () => void;
}

// Framer Motion variants for staggered entrance
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function GameLobby({
  roomCode,
  gameId,
  players,
  spectators,
  myPlayerId,
  hostId,
  minPlayers,
  maxPlayers,
  onReady,
  onStartGame,
}: GameLobbyProps) {
  const game = gameRegistry.byId(gameId);
  const isHost = myPlayerId != null && myPlayerId === hostId;
  const me = players.find((p) => p.id === myPlayerId);

  // Host can start when: enough players + all non-host players are ready
  const canStart = useMemo(() => {
    if (players.length < minPlayers) return false;
    return players.every((p) => p.id === hostId || p.isReady);
  }, [players, minPlayers, hostId]);

  const startDisabledReason = useMemo(() => {
    if (players.length < minPlayers) {
      return `Need at least ${minPlayers} players (${players.length}/${minPlayers})`;
    }
    const notReady = players.filter((p) => p.id !== hostId && !p.isReady);
    if (notReady.length > 0) {
      return `${notReady.length} player${notReady.length > 1 ? "s" : ""} not ready`;
    }
    return null;
  }, [players, minPlayers, hostId]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8"
    >
      {/* Game header */}
      <motion.div variants={item} className="text-center">
        <span className="text-4xl">{game?.emoji ?? "🎮"}</span>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          {game?.name ?? "Game Lobby"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Waiting for players to join…
        </p>
      </motion.div>

      {/* Invite panel */}
      <motion.div variants={item}>
        <InvitePanel roomCode={roomCode} />
      </motion.div>

      {/* Player list */}
      <motion.div variants={item}>
        <div className="rounded-xl border border-white/5 bg-surface p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Users className="h-4 w-4" />
            <span>
              Players ({players.length}/{maxPlayers})
            </span>
          </div>
          <PlayerList
            players={players}
            spectators={spectators}
            myPlayerId={myPlayerId}
            hostId={hostId}
            phase="waiting"
          />
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={item} className="flex flex-col gap-3">
        {isHost ? (
          /* Host: Start Game button */
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all",
                canStart
                  ? "bg-ember text-white shadow-lg shadow-ember/25 hover:bg-ember/90 active:translate-y-px"
                  : "cursor-not-allowed bg-elevated text-text-muted"
              )}
            >
              <Play className="h-4 w-4" />
              Start Game
            </button>
            {startDisabledReason && (
              <p className="text-xs text-text-muted">{startDisabledReason}</p>
            )}
          </div>
        ) : (
          /* Non-host: Ready toggle */
          me && (
            <button
              onClick={onReady}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all active:translate-y-px",
                me.isReady
                  ? "bg-cyan/15 text-cyan ring-1 ring-cyan/30 hover:bg-cyan/20"
                  : "bg-elevated text-text-secondary hover:bg-white/10 hover:text-foreground"
              )}
            >
              <CheckCircle2
                className={cn("h-4 w-4", me.isReady ? "text-cyan" : "text-text-muted")}
              />
              {me.isReady ? "Ready!" : "Ready Up"}
            </button>
          )
        )}
      </motion.div>

      {/* Waiting dots animation */}
      <motion.div
        variants={item}
        className="flex items-center justify-center gap-1.5 py-2"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ember/60"
            style={{
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
