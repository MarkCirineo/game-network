// ============================================================
// ArcadeKit — App Constants
// ============================================================

export const APP_NAME = "ArcadeKit";
export const APP_DESCRIPTION =
  "Play instant multiplayer games with friends. No downloads, no accounts.";
export const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// WebSocket
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
export const WS_RECONNECT_BASE_DELAY = 1000;
export const WS_RECONNECT_MAX_DELAY = 15000;
export const WS_RECONNECT_MAX_ATTEMPTS = 10;
export const WS_PING_INTERVAL = 10000;

// Room
export const ROOM_CODE_LENGTH = 4;
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Game Server
export const GAME_SERVER_URL =
  process.env.GAME_SERVER_INTERNAL_URL || "http://localhost:3001";

// Session
export const SESSION_TOKEN_KEY = "arcadekit_session_token";
export const PLAYER_NAME_KEY = "arcadekit_player_name";
