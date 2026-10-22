// ============================================================
// ArcadeKit — GameShell
// The core wrapper component that provides the full platform
// experience around any game. Every game is rendered inside this.
// ============================================================

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGameSocket } from "@/lib/ws/client";
import { useGameStore } from "@/lib/stores/gameStore";
import { trackEvent } from "@/lib/analytics";
import { authClient } from "@/lib/auth-client";
import {
  getSessionToken,
  getSavedPlayerName,
  savePlayerName,
} from "@/lib/utils/playerSession";
import { readRoomOptions } from "@/lib/utils/roomOptions";
import { PlayerList } from "./PlayerList";
import { SpectatorBanner } from "./SpectatorBanner";
import { InvitePanel } from "./InvitePanel";
import { ReconnectOverlay } from "./ReconnectOverlay";
import { GameLobby } from "./GameLobby";
import { GameOver } from "./GameOver";

import type {
  GameComponentProps,
  GameDefinition,
  GameOptionSchema,
  GameResultProps,
} from "@/games/types";
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
  ResultComponent?: ComponentType<GameResultProps>;
  /** Drop the max-w-4xl cap from xl up (the game sizes itself) */
  wideLayout?: boolean;
  optionsSchema?: GameOptionSchema[];
  LobbyOptions?: GameDefinition["LobbyOptions"];
  prepareStart?: GameDefinition["prepareStart"];
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
  ResultComponent,
  wideLayout,
  optionsSchema,
  LobbyOptions,
  prepareStart,
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
  const [roomExpired, setRoomExpired] = useState(false);
  const [gameOptions, setGameOptions] = useState<Record<string, unknown>>(() => {
    // Initialize from schema defaults
    const defaults: Record<string, unknown> = {};
    if (optionsSchema) {
      for (const opt of optionsSchema) {
        defaults[opt.key] = opt.default;
      }
    }
    // A starting choice from the page that created the room (e.g. a pack)
    return { ...defaults, ...readRoomOptions(roomCode) };
  });
  const [isStarting, setIsStarting] = useState(false);

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
  const joinError = useGameStore((s) => s.joinError);

  const sessionToken = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getSessionToken();
  }, []);

  // Signed-in players join as their username, without the name step.
  // If the room refuses it (e.g. a guest already took that name), the
  // join error shows the normal name form instead.
  const { data: accountSession, isPending: accountPending } = authClient.useSession();
  const accountName =
    accountSession?.user.displayUsername || accountSession?.user.username || null;
  const autoJoining = !hasJoined && Boolean(accountName) && !joinError;
  const joinName = hasJoined ? playerName : autoJoining ? (accountName ?? "") : "";

  // Remember the auto-join for this tab, so a refresh rejoins the same way
  useEffect(() => {
    if (autoJoining && myPlayerId && accountName) persistJoin(roomCode, accountName);
  }, [autoJoining, myPlayerId, accountName, roomCode]);

  // WebSocket connection
  const { sendMessage, connectionStatus, sendAction } = useGameSocket({
    roomCode,
    playerName: joinName,
    sessionToken,
    enabled: (hasJoined || autoJoining) && !!joinName,
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

  // Handle terminal join errors — return to name entry or show room-expired screen
  useEffect(() => {
    if (joinError) {
      // If we were already connected (had a player ID), this is a room-expired scenario
      if (myPlayerId) {
        setRoomExpired(true);
      } else {
        clearPersistedJoin(roomCode);
        setHasJoined(false);
      }
    }
  }, [joinError, roomCode, myPlayerId]);

  // Host starts the game; some games need a step first (e.g. a pack pass)
  const handleStartGame = async () => {
    if (isStarting) return;
    let options = gameOptions;
    if (prepareStart) {
      setIsStarting(true);
      try {
        options = await prepareStart(gameOptions, roomCode);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't start the game.");
        return;
      } finally {
        setIsStarting(false);
      }
    }
    sendMessage({ type: "start_game", options });
  };

  // Handle join — persist to sessionStorage
  const handleJoin = (name: string) => {
    useGameStore.getState().setJoinError(null);
    setPlayerName(name);
    savePlayerName(name);
    persistJoin(roomCode, name);
    setHasJoined(true);
  };

  // Room expired screen — shown when the room disappears mid-session
  if (roomExpired) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="text-4xl">⏰</span>
          <h1 className="font-heading text-2xl font-bold">Room Expired</h1>
          <p className="text-center text-sm text-text-secondary">
            {joinError || "This room no longer exists. It may have been closed or timed out."}
          </p>
          <Link
            href="/games"
            className="mt-2 inline-flex h-10 items-center rounded-lg bg-ember px-6 text-sm font-medium text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
          >
            Browse Games
          </Link>
        </motion.div>
      </div>
    );
  }

  // Checking whether this visitor is signed in, or joining as their
  // username: don't flash the name form at signed-in players
  if (!hasJoined && (accountPending || (autoJoining && !myPlayerId))) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-6 w-6 animate-spin text-ember" />
        {autoJoining && (
          <p className="text-sm text-text-secondary">
            Joining as <span className="font-semibold text-text-primary">{accountName}</span>…
          </p>
        )}
      </div>
    );
  }

  // Name entry screen (guests, or a signed-in player whose name was refused)
  if (!hasJoined && !autoJoining) {
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

          {joinError && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400">
              {joinError}
            </p>
          )}
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


      {/* Desktop sidebar — fixed HUD rail at viewport left edge */}
      <aside className="fixed left-6 top-14 bottom-0 z-10 hidden w-56 flex-col justify-center space-y-4 overflow-y-auto lg:flex xl:left-8 xl:w-64">
        <PlayerList
          players={players}
          spectators={spectators}
          myPlayerId={myPlayerId}
          hostId={hostId}
          phase={phase}
        />
        {phase !== "finished" && <InvitePanel roomCode={roomCode} gameId={gameId} />}
      </aside>

      {/* Main content area — game is always centered */}
      <div
        className={`mx-auto flex w-full max-w-4xl flex-1 px-4 py-4 ${wideLayout ? "xl:max-w-none" : ""}`}
      >
        {/* Game area — always centered */}
        <div className="mx-auto flex w-full flex-col items-center lg:mt-[12vh] xl:mt-[15vh]">
          <AnimatePresence mode="wait">
            {phase === "waiting" && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
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
                  onStartGame={handleStartGame}
                  isStarting={isStarting}
                  optionsSchema={optionsSchema}
                  gameOptions={gameOptions}
                  onOptionsChange={setGameOptions}
                  LobbyOptions={LobbyOptions}
                />
              </motion.div>
            )}

            {phase === "playing" && (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex w-full flex-1 flex-col"
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
                className="w-full"
              >
                <GameOver
                  result={gameResult}
                  players={players}
                  myPlayerId={myPlayerId}
                  isSpectator={isSpectator}
                  onRematch={() => {
                    trackEvent("after-game", { game: gameId, choice: "rematch" });
                    sendMessage({ type: "rematch_request" });
                  }}
                  onBackToGames={() => {
                    trackEvent("after-game", { game: gameId, choice: "back-to-games" });
                    clearPersistedJoin(roomCode);
                    router.push("/games");
                  }}
                  rematchRequests={rematchRequests}
                  details={
                    ResultComponent ? (
                      <ResultComponent
                        gameState={gameState}
                        myPlayerId={myPlayerId || ""}
                        players={players}
                        isSpectator={isSpectator}
                      />
                    ) : undefined
                  }
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
                <InvitePanel roomCode={roomCode} gameId={gameId} />
              </div>
            )}
          </div>
        </details>
      </div>


    </div>
  );
}
