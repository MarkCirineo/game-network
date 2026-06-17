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
import { Users, Play, CheckCircle2, Settings } from "lucide-react";
import type { PlayerInfo, SpectatorInfo } from "../../../shared/messages";
import type { GameOptionSchema } from "../../../shared/gameOptions";

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
  optionsSchema?: GameOptionSchema[];
  gameOptions?: Record<string, unknown>;
  onOptionsChange?: (options: Record<string, unknown>) => void;
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
  optionsSchema,
  gameOptions,
  onOptionsChange,
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

  const handleOptionChange = (key: string, value: unknown) => {
    if (!onOptionsChange || !gameOptions) return;
    onOptionsChange({ ...gameOptions, [key]: value });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 xl:max-w-xl xl:gap-8"
    >
      {/* Game header */}
      <motion.div variants={item} className="text-center">
        <span className="text-4xl xl:text-5xl">{game?.emoji ?? "🎮"}</span>
        <h1 className="mt-2 text-2xl font-bold text-foreground xl:text-3xl">
          {game?.name ?? "Game Lobby"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary xl:text-base">
          Waiting for players to join…
        </p>
      </motion.div>

      {/* Invite panel */}
      <motion.div variants={item}>
        <InvitePanel roomCode={roomCode} />
      </motion.div>

      {/* Player list */}
      <motion.div variants={item}>
        <div className="rounded-xl border border-white/5 bg-surface p-4 xl:p-5">
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

      {/* Game options */}
      {optionsSchema && optionsSchema.length > 0 && gameOptions && (
        <motion.div variants={item}>
          <div className="rounded-xl border border-white/5 bg-surface p-4 xl:p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Settings className="h-4 w-4" />
              <span>Game Settings</span>
            </div>
            <div className="space-y-3">
              {optionsSchema.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between gap-3">
                  <label
                    htmlFor={`opt-${opt.key}`}
                    className="text-sm font-medium text-foreground"
                  >
                    {opt.label}
                  </label>

                  {opt.type === "select" && opt.options ? (
                    isHost ? (
                      <select
                        id={`opt-${opt.key}`}
                        value={String(gameOptions[opt.key] ?? opt.default)}
                        onChange={(e) => {
                          // Parse value back to number if it looks like one
                          const raw = e.target.value;
                          const num = Number(raw);
                          handleOptionChange(opt.key, isNaN(num) ? raw : num);
                        }}
                        className="cursor-pointer rounded-lg border border-white/10 bg-elevated px-3 py-1.5 text-sm text-foreground outline-none transition-colors hover:border-white/20 focus:border-violet/50 focus:ring-1 focus:ring-violet/30"
                      >
                        {opt.options.map((o) => (
                          <option key={String(o.value)} value={String(o.value)}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-lg bg-elevated px-3 py-1.5 text-sm text-muted-foreground">
                        {opt.options.find((o) => String(o.value) === String(gameOptions[opt.key]))?.label ??
                          String(gameOptions[opt.key] ?? opt.default)}
                      </span>
                    )
                  ) : opt.type === "number" ? (
                    isHost ? (
                      <input
                        id={`opt-${opt.key}`}
                        type="number"
                        min={opt.min}
                        max={opt.max}
                        value={Number(gameOptions[opt.key] ?? opt.default)}
                        onChange={(e) => handleOptionChange(opt.key, Number(e.target.value))}
                        className="w-20 rounded-lg border border-white/10 bg-elevated px-3 py-1.5 text-sm text-foreground outline-none transition-colors hover:border-white/20 focus:border-violet/50 focus:ring-1 focus:ring-violet/30"
                      />
                    ) : (
                      <span className="rounded-lg bg-elevated px-3 py-1.5 text-sm text-muted-foreground">
                        {String(gameOptions[opt.key] ?? opt.default)}
                      </span>
                    )
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div variants={item} className="flex flex-col gap-3">
        {isHost ? (
          /* Host: Start Game button */
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={cn(
                "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all xl:py-3.5 xl:text-base",
                canStart
                  ? "bg-violet text-white shadow-lg shadow-violet/25 hover:bg-violet/90 active:translate-y-px"
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
                "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all active:translate-y-px xl:py-3.5 xl:text-base",
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
            className="h-1.5 w-1.5 rounded-full bg-violet/60"
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
