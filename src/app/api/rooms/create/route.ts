// ============================================================
// ArcadeKit — Create Room API Route
// POST /api/rooms/create — creates a new game room
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GAME_SERVER_URL } from "@/lib/constants";

const VALID_GAME_IDS = ["tic-tac-toe", "rock-paper-scissors"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId } = body;

    if (!gameId || !VALID_GAME_IDS.includes(gameId)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }

    // Forward to game server
    const res = await fetch(`${GAME_SERVER_URL}/create-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: errText || "Failed to create room" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[ArcadeKit] Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room. Game server may be unavailable." },
      { status: 503 }
    );
  }
}

// Also support GET for quick room creation via link
export async function GET(request: NextRequest) {
  const gameId = request.nextUrl.searchParams.get("gameId");

  if (!gameId || !VALID_GAME_IDS.includes(gameId)) {
    return NextResponse.redirect(new URL("/games", request.url));
  }

  try {
    const res = await fetch(`${GAME_SERVER_URL}/create-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL(`/games/${gameId}`, request.url));
    }

    const data = await res.json();
    return NextResponse.redirect(
      new URL(`/room/${data.roomCode}`, request.url)
    );
  } catch {
    return NextResponse.redirect(new URL(`/games/${gameId}`, request.url));
  }
}
