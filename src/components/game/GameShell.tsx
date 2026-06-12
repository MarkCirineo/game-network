// ============================================================
// ArcadeKit — GameShell
// The core wrapper component that provides the full platform
// experience around any game. Every game is rendered inside this.
// ============================================================

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSocket } from "@/lib/ws/client";
import { useGameStore } from "@/lib/stores/gameStore";
import {
  getSessionToken,
  getSavedPlayerName,
  savePlayerName,
} from "@/lib/utils/playerSession";
import { PlayerList } from "./PlayerList";
import { SpectatorBanner } from "./SpectatorBanner";
import { InvitePanel } from "./InvitePanel";
import { ReconnectOverlay } from "./ReconnectOverlay";
import { GameLobby } from "./GameLobby";
import { GameOver } from "./GameOver";
import { AdSlot } from "./AdSlot";
import type { GameComponentProps } from "@/games/types";
import type { ComponentType } from "react";

interface GameShellProps {
  roomCode: string;
  gameId: string;
  gameName: string;
  gameEmoji: string;
  accentColor: string;
  minPlayers: number;
  maxPlayers: number;
  GameComponent: ComponentType<GameComponentProps>;
}

export function GameShell({
  roomCode,
  gameId,
  gameName,
  gameEmoji,
  accentColor,
  minPlayers,
  maxPlayers,
  GameComponent,
}: GameShellProps) {
  const [playerName, setPlayerName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Get session token and saved name
  useEffect(() => {
    const saved = getSavedPlayerName();
    if (saved) {
      setNameInput(saved);
    }
  }, []);

  // Zustand state
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const spectators = useGameStore((s) => s.spectators);
  const hostId = useGameStore((s) => s.hostId);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const isSpectator = useGameStore((s) => s.isSpectator);
  const gameState = useGameStore((s) => s.gameState);
  const gameResult = useGameStore((s) => s.gameResult);
  const rematchRequests = useGameStore((s) => s.rematchRequests);
  const reset = useGameStore((s) => s.reset);

  const sessionToken = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getSessionToken();
  }, []);

  // WebSocket connection
  const { sendMessage, connectionStatus, sendAction } = useGameSocket({
    roomCode,
    playerName,
    sessionToken,
    enabled: hasJoined && !!playerName,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Apply game accent color
  useEffect(() => {
    document.documentElement.style.setProperty("--game-accent", accentColor);
    return () => {
      document.documentElement.style.removeProperty("--game-accent");
    };
  }, [accentColor]);

  // Name entry screen
  if (!hasJoined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center">
            <span className="text-4xl">{gameEmoji}</span>
            <h1 className="mt-3 font-heading text-2xl font-bold">
              Join {gameName}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Room: <span className="font-mono font-bold text-violet">{roomCode}</span>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = nameInput.trim();
              if (name.length >= 1 && name.length <= 20) {
                setPlayerName(name);
                savePlayerName(name);
                setHasJoined(true);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="player-name"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Your Name
              </label>
              <input
                id="player-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                autoFocus
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-foreground placeholder:text-text-muted focus:border-violet focus:outline-none focus:ring-1 focus:ring-violet"
              />
            </div>
            <button
              type="submit"
              disabled={nameInput.trim().length < 1}
              className="h-11 w-full rounded-lg bg-violet font-medium text-white transition-all hover:bg-violet/90 hover:shadow-lg hover:shadow-violet/25 disabled:opacity-50 disabled:hover:bg-violet disabled:hover:shadow-none"
            >
              Join Game
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Determine what's currently showing based on turn
  const isMyTurn = (() => {
    if (isSpectator || phase !== "playing") return false;
    const gs = gameState as Record<string, unknown> | null;
    if (!gs) return false;
    return gs.currentTurn === myPlayerId;
  })();

  return (
    <div className="flex flex-1 flex-col">
      {/* Reconnect overlay */}
      <AnimatePresence>
        {(connectionStatus === "reconnecting" ||
          connectionStatus === "connecting") && (
          <ReconnectOverlay status={connectionStatus} />
        )}
      </AnimatePresence>

      {/* Spectator banner */}
      {isSpectator && <SpectatorBanner spectatorCount={spectators.length} />}

      {/* Ad slot — top */}
      <AdSlot position="top" className="mx-auto max-w-6xl" />

      {/* Main content area */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-4 py-4 lg:gap-6">
        {/* Sidebar (desktop only) */}
        <aside className="hidden w-64 shrink-0 space-y-4 lg:block">
          <PlayerList
            players={players}
            spectators={spectators}
            myPlayerId={myPlayerId}
            hostId={hostId}
            phase={phase}
          />
          {phase !== "finished" && <InvitePanel roomCode={roomCode} />}
        </aside>

        {/* Game area */}
        <div className="flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            {phase === "waiting" && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GameLobby
                  roomCode={roomCode}
                  gameId={gameId}
                  players={players}
                  spectators={spectators}
                  myPlayerId={myPlayerId}
                  hostId={hostId}
                  minPlayers={minPlayers}
                  maxPlayers={maxPlayers}
                  onReady={() => sendMessage({ type: "player_ready" })}
                  onStartGame={() => sendMessage({ type: "start_game" })}
                />
              </motion.div>
            )}

            {phase === "playing" && (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col"
              >
                <GameComponent
                  gameState={gameState}
                  myPlayerId={myPlayerId || ""}
                  isMyTurn={isMyTurn}
                  isSpectator={isSpectator}
                  players={players}
                  spectators={spectators}
                  sendAction={sendAction}
                  phase={phase}
                />
              </motion.div>
            )}

            {phase === "finished" && gameResult && (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GameOver
                  result={gameResult}
                  players={players}
                  myPlayerId={myPlayerId}
                  isSpectator={isSpectator}
                  onRematch={() =>
                    sendMessage({ type: "rematch_request" })
                  }
                  onBackToGames={() => {}}
                  rematchRequests={rematchRequests}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile player list (bottom drawer) */}
      <div className="border-t border-white/5 px-4 py-3 lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-text-secondary">
            <span>
              Players ({players.length})
              {spectators.length > 0 && ` • ${spectators.length} watching`}
            </span>
            <span className="transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="mt-3">
            <PlayerList
              players={players}
              spectators={spectators}
              myPlayerId={myPlayerId}
              hostId={hostId}
              phase={phase}
            />
            {phase !== "finished" && (
              <div className="mt-3">
                <InvitePanel roomCode={roomCode} />
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Ad slot — bottom */}
      <AdSlot position="bottom" className="mx-auto max-w-6xl" />
    </div>
  );
}
