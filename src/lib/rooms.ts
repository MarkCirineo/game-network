// ============================================================
// ArcadeKit — Room Lookups
// Client-side helpers for asking the game server about a room.
// ============================================================

import type { RoomInfoResponse } from "../../shared/messages";

/**
 * Fetch room info with fallback.
 * Tries the Next.js API proxy first, then the game server directly.
 * Throws Error("Room not found") when the code doesn't exist.
 */
export async function fetchRoomInfo(roomCode: string): Promise<RoomInfoResponse> {
  // Try Next.js API first
  try {
    const res = await fetch(`/api/rooms/${roomCode}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API proxy failed, try direct
  }

  // Fallback: call game server directly via WS_URL
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
  const httpUrl = wsUrl.replace(/^ws/, "http");

  const res = await fetch(`${httpUrl}/room-info/${roomCode.toUpperCase()}`);
  if (!res.ok) {
    throw new Error(res.status === 404 ? "Room not found" : "Server error");
  }
  return await res.json();
}
