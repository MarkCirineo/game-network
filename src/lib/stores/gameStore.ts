// ============================================================
// ArcadeKit — Zustand Game Store
// Central state for room, game, and connection management.
// ============================================================

import { create } from "zustand";
import type {
  RoomState,
  PlayerInfo,
  SpectatorInfo,
  GameStatus,
  RoomPhase,
  ServerMessage,
} from "../../../shared/messages";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

interface GameStore {
  // Connection
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;

  // Room state
  roomCode: string | null;
  gameId: string | null;
  phase: RoomPhase;
  players: PlayerInfo[];
  spectators: SpectatorInfo[];
  hostId: string | null;

  // Player identity
  myPlayerId: string | null;
  isSpectator: boolean;

  // Game state (generic — each game defines its own shape)
  gameState: unknown;
  gameResult: GameStatus | null;

  // Rematch
  rematchRequests: Set<string>;

  // Actions
  setRoomState: (room: RoomState) => void;
  setGameState: (state: unknown) => void;
  setGameResult: (result: GameStatus) => void;
  addPlayer: (player: PlayerInfo) => void;
  removePlayer: (playerId: string) => void;
  setPlayerReady: (playerId: string, isReady: boolean) => void;
  addSpectator: (spectator: SpectatorInfo) => void;
  removeSpectator: (spectatorId: string) => void;
  setHostId: (hostId: string) => void;
  addRematchRequest: (playerId: string) => void;
  setMyPlayerId: (id: string) => void;
  setIsSpectator: (isSpectator: boolean) => void;
  handleServerMessage: (msg: ServerMessage) => void;
  reset: () => void;

  // Derived (computed inline)
  get isMyTurn(): boolean;
  get amIHost(): boolean;
}

const initialState = {
  connectionStatus: "disconnected" as ConnectionStatus,
  roomCode: null as string | null,
  gameId: null as string | null,
  phase: "waiting" as RoomPhase,
  players: [] as PlayerInfo[],
  spectators: [] as SpectatorInfo[],
  hostId: null as string | null,
  myPlayerId: null as string | null,
  isSpectator: false,
  gameState: null as unknown,
  gameResult: null as GameStatus | null,
  rematchRequests: new Set<string>(),
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setRoomState: (room) =>
    set({
      roomCode: room.roomCode,
      gameId: room.gameId,
      phase: room.phase,
      players: room.players,
      spectators: room.spectators,
      hostId: room.hostId,
      gameState: room.gameState ?? get().gameState,
    }),

  setGameState: (state) => set({ gameState: state }),
  setGameResult: (result) => set({ gameResult: result, phase: "finished" }),

  addPlayer: (player) =>
    set((s) => ({
      players: [...s.players.filter((p) => p.id !== player.id), player],
    })),

  removePlayer: (playerId) =>
    set((s) => {
      // During finished phase, keep the player so their name still shows on GameOver
      if (s.phase === "finished") {
        return {
          players: s.players.map((p) =>
            p.id === playerId ? { ...p, isConnected: false } : p
          ),
        };
      }
      return {
        players: s.players.filter((p) => p.id !== playerId),
      };
    }),

  setPlayerReady: (playerId, isReady) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, isReady } : p
      ),
    })),

  addSpectator: (spectator) =>
    set((s) => ({
      spectators: [
        ...s.spectators.filter((sp) => sp.id !== spectator.id),
        spectator,
      ],
    })),

  removeSpectator: (spectatorId) =>
    set((s) => ({
      spectators: s.spectators.filter((sp) => sp.id !== spectatorId),
    })),

  setHostId: (hostId) => set({ hostId }),
  addRematchRequest: (playerId) =>
    set((s) => {
      const next = new Set(s.rematchRequests);
      next.add(playerId);
      return { rematchRequests: next };
    }),

  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setIsSpectator: (isSpectator) => set({ isSpectator }),

  handleServerMessage: (msg) => {
    const store = get();
    switch (msg.type) {
      case "room_state":
        store.setRoomState(msg.room);
        break;
      case "game_state_update":
        store.setGameState(msg.state);
        break;
      case "player_joined":
        store.addPlayer(msg.player);
        break;
      case "player_left":
        store.removePlayer(msg.playerId);
        break;
      case "player_ready_changed":
        store.setPlayerReady(msg.playerId, msg.isReady);
        break;
      case "spectator_joined":
        store.addSpectator(msg.spectator);
        break;
      case "spectator_left":
        store.removeSpectator(msg.spectatorId);
        break;
      case "game_started":
        set({ phase: "playing", gameState: msg.initialState, gameResult: null, rematchRequests: new Set() });
        break;
      case "game_over": {
        // Delay game_over processing so the reveal animation can play
        const timer = setTimeout(() => {
          store.setGameResult(msg.result);
        }, 2500);
        // Store the timer so it can be cleared on reset
        set({ _gameOverTimer: timer } as Partial<GameStore>);
        break;
      }
      case "host_changed":
        store.setHostId(msg.newHostId);
        break;
      case "rematch_requested":
        store.addRematchRequest(msg.playerId);
        break;
      case "error":
        console.error(`[ArcadeKit] Server error: ${msg.code} — ${msg.message}`);
        break;
    }
  },

  reset: () => set({ ...initialState, rematchRequests: new Set() }),

  get isMyTurn() {
    const state = get();
    if (state.isSpectator || state.phase !== "playing") return false;
    const gs = state.gameState as Record<string, unknown> | null;
    if (!gs) return false;
    return gs.currentTurn === state.myPlayerId;
  },

  get amIHost() {
    return get().hostId === get().myPlayerId;
  },
}));
