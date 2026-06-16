// ============================================================
// ArcadeKit — GameShell
// The core wrapper component that provides the full platform
// experience around any game. Every game is rendered inside this.
// ============================================================

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

import type { GameComponentProps, GameOptionSchema } from "@/games/types";
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
  optionsSchema?: GameOptionSchema[];
}

// Helpers to persist join state in sessionStorage (per-tab, survives remounts/HMR)
function getSessionJoinKey(roomCode: string) {
  return `arcadekit_joined_${roomCode}`;
}

function getPersistedJoin(roomCode: string): { name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(getSessionJoinKey(roomCode));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistJoin(roomCode: string, name: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    getSessionJoinKey(roomCode),
    JSON.stringify({ name })
  );
}

function clearPersistedJoin(roomCode: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(getSessionJoinKey(roomCode));
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
  optionsSchema,
}: GameShellProps) {
  const router = useRouter();

  // Initialize from persisted join state (survives HMR / accidental remounts)
  const [playerName, setPlayerName] = useState(() => {
    const persisted = getPersistedJoin(roomCode);
    return persisted?.name ?? "";
  });
  const [hasJoined, setHasJoined] = useState(() => {
    return getPersistedJoin(roomCode) !== null;
  });
  const [nameInput, setNameInput] = useState("");
  const [gameOptions, setGameOptions] = useState<Record<string, unknown>>(() => {
    // Initialize from schema defaults
    const defaults: Record<string, unknown> = {};
    if (optionsSchema) {
      for (const opt of optionsSchema) {
        defaults[opt.key] = opt.default;
      }
    }
    return defaults;
  });

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

  // Reset store on true unmount (navigation away). Empty deps = only on unmount.
  useEffect(() => {
    return () => {
      useGameStore.getState().reset();
    };
  }, []);

  // Apply game accent color
  useEffect(() => {
    document.documentElement.style.setProperty("--game-accent", accentColor);
    return () => {
      document.documentElement.style.removeProperty("--game-accent");
    };
  }, [accentColor]);

  // Handle join — persist to sessionStorage
  const handleJoin = (name: string) => {
    setPlayerName(name);
    savePlayerName(name);
    persistJoin(roomCode, name);
    setHasJoined(true);
  };

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
              Room: <span className="font-mono font-bold text-ember">{roomCode}</span>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = nameInput.trim();
              if (name.length >= 1 && name.length <= 20) {
                handleJoin(name);
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
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-foreground placeholder:text-text-muted focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember"
              />
            </div>
            <button
              type="submit"
              disabled={nameInput.trim().length < 1}
              className="h-11 w-full rounded-lg bg-ember font-medium text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25 disabled:opacity-50 disabled:hover:bg-ember disabled:hover:shadow-none"
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



      {/* Main content area — game is always centered */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 px-4 py-4">
        {/* Floating sidebar (desktop only) — doesn't affect game centering */}
        <aside className="absolute left-4 top-4 hidden w-56 space-y-4 lg:block">
          <PlayerList
            players={players}
            spectators={spectators}
            myPlayerId={myPlayerId}
            hostId={hostId}
            phase={phase}
          />
          {phase !== "finished" && <InvitePanel roomCode={roomCode} />}
        </aside>

        {/* Game area — always centered */}
        <div className="mx-auto flex w-full max-w-lg flex-col">
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
                  onStartGame={() => sendMessage({ type: "start_game", options: gameOptions })}
                  optionsSchema={optionsSchema}
                  gameOptions={gameOptions}
                  onOptionsChange={setGameOptions}
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
                  onBackToGames={() => {
                    clearPersistedJoin(roomCode);
                    router.push("/games");
                  }}
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


    </div>
  );
}
