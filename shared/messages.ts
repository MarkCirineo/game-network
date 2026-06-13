// ============================================================
// ArcadeKit — WebSocket Message Protocol
// Shared between client (Next.js) and game server
// ============================================================

import type { GameOptionSchema } from './gameOptions.js';

// ------------------------------------------------------------
// Player & Room Types (used in messages)
// ------------------------------------------------------------

export interface PlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
}

export interface SpectatorInfo {
  id: string;
  name: string;
  connectedAt: number;
}

export type RoomPhase = 'waiting' | 'playing' | 'finished';

export interface RoomState {
  roomCode: string;
  gameId: string;
  phase: RoomPhase;
  players: PlayerInfo[];
  spectators: SpectatorInfo[];
  hostId: string;
  gameState?: unknown;
  createdAt: number;
  gameOptionsSchema?: GameOptionSchema[];
}

export interface GameStatus {
  isOver: boolean;
  winnerId?: string | null; // null = draw
  scores?: Record<string, number>;
  reason?: string;
}

// ------------------------------------------------------------
// Client → Server Messages
// ------------------------------------------------------------

export type ClientMessage =
  | { type: 'join_room'; roomCode: string; playerName: string; sessionToken: string }
  | { type: 'game_action'; action: unknown }
  | { type: 'player_ready' }
  | { type: 'start_game'; options?: Record<string, unknown> }
  | { type: 'rematch_request' }
  | { type: 'ping' };

// ------------------------------------------------------------
// Server → Client Messages
// ------------------------------------------------------------

export type ServerMessage =
  | { type: 'room_state'; room: RoomState }
  | { type: 'game_state_update'; state: unknown }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; playerId: string }
  | { type: 'player_ready_changed'; playerId: string; isReady: boolean }
  | { type: 'spectator_joined'; spectator: SpectatorInfo }
  | { type: 'spectator_left'; spectatorId: string }
  | { type: 'game_started'; initialState: unknown }
  | { type: 'game_over'; result: GameStatus }
  | { type: 'host_changed'; newHostId: string }
  | { type: 'rematch_requested'; playerId: string }
  | { type: 'error'; code: ErrorCode; message: string }
  | { type: 'pong' };

// ------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------

export type ErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'GAME_NOT_FOUND'
  | 'INVALID_ACTION'
  | 'NOT_YOUR_TURN'
  | 'GAME_NOT_STARTED'
  | 'GAME_ALREADY_STARTED'
  | 'NOT_HOST'
  | 'NOT_ENOUGH_PLAYERS'
  | 'INVALID_MESSAGE'
  | 'RATE_LIMITED'
  | 'SESSION_CONFLICT';

// ------------------------------------------------------------
// Internal Server Messages (game server ↔ Next.js API)
// ------------------------------------------------------------

export interface CreateRoomRequest {
  gameId: string;
}

export interface CreateRoomResponse {
  roomCode: string;
}

export interface RoomInfoResponse {
  roomCode: string;
  gameId: string;
  phase: RoomPhase;
  playerCount: number;
  maxPlayers: number;
  spectatorCount: number;
}
