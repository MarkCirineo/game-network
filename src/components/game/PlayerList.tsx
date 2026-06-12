// ============================================================
// ArcadeKit — Player List
// Sidebar component showing players and spectators in a room.
// ============================================================

"use client";

import { cn } from "@/lib/utils";
import { Eye, Check, Circle, Crown } from "lucide-react";
import type { PlayerInfo, SpectatorInfo, RoomPhase } from "../../../shared/messages";

// Rotating avatar color palette
const AVATAR_COLORS = [
  "bg-violet",
  "bg-cyan",
  "bg-pink",
  "bg-amber",
  "bg-blue-500",
  "bg-emerald-500",
] as const;

interface PlayerListProps {
  players: PlayerInfo[];
  spectators: SpectatorInfo[];
  myPlayerId: string | null;
  hostId: string | null;
  phase: RoomPhase;
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function PlayerList({
  players,
  spectators,
  myPlayerId,
  hostId,
  phase,
}: PlayerListProps) {
  return (
    <div className="flex flex-col gap-1">
      {/* Player entries */}
      {players.map((player, idx) => {
        const isMe = player.id === myPlayerId;
        const isHost = player.id === hostId;
        const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

        return (
          <div
            key={player.id}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors",
              isMe && "bg-white/[0.03]",
              phase === "playing" && isMe && "ring-1 ring-violet/30"
            )}
          >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white",
                  colorClass,
                  !player.isConnected && "opacity-40"
                )}
              >
                {getInitials(player.name)}
              </div>
              {/* Online/offline dot */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-surface",
                  player.isConnected
                    ? "bg-cyan pulse-dot"
                    : "bg-text-muted"
                )}
              />
            </div>

            {/* Name + badges */}
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span
                className={cn(
                  "truncate text-sm font-medium",
                  player.isConnected
                    ? "text-foreground"
                    : "text-text-muted"
                )}
              >
                {player.name}
              </span>
              {isMe && (
                <span className="shrink-0 text-[10px] text-text-muted">(You)</span>
              )}
              {isHost && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-violet/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet">
                  <Crown className="h-2.5 w-2.5" />
                  Host
                </span>
              )}
            </div>

            {/* Ready indicator (only in waiting phase) */}
            {phase === "waiting" && (
              <div className="shrink-0">
                {player.isReady || isHost ? (
                  <Check className="h-3.5 w-3.5 text-cyan" />
                ) : (
                  <Circle className="h-3 w-3 text-text-muted" />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Spectator count */}
      {spectators.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-white/5 px-2.5 pt-2">
          <Eye className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-xs text-text-muted">
            {spectators.length} watching
          </span>
        </div>
      )}
    </div>
  );
}
