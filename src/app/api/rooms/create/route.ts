// ============================================================
// ArcadeKit — Create Room API Route
// POST /api/rooms/create — creates a new game room
// GET  /api/rooms/create?gameId=xxx — creates and redirects
// ============================================================

import { NextRequest, NextResponse } from "next/server";

const VALID_GAME_IDS = ["tic-tac-toe", "rock-paper-scissors"];

function getGameServerUrl(): string {
  return process.env.GAME_SERVER_INTERNAL_URL || "http://127.0.0.1:3001";
}

async function createRoomOnServer(gameId: string): Promise<{ roomCode: string } | null> {
  const serverUrl = getGameServerUrl();
  const url = `${serverUrl}/create-room`;
  
  console.log(`[ArcadeKit] Creating room: POST ${url} gameId=${gameId}`);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[ArcadeKit] Game server returned ${res.status}: ${errText}`);
    return null;
  }

  const data = await res.json();
  console.log(`[ArcadeKit] Room created: ${data.roomCode}`);
  return data;
}

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

    const data = await createRoomOnServer(gameId);
    if (!data) {
      return NextResponse.json(
        { error: "Failed to create room" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const serverUrl = getGameServerUrl();
    console.error("[ArcadeKit] Create room POST error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create room. Game server may be unavailable.",
        debug: { message: errMsg, url: `${serverUrl}/create-room` }
      },
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
    const data = await createRoomOnServer(gameId);
    
    if (!data) {
      return NextResponse.redirect(new URL(`/games/${gameId}`, request.url));
    }

    return NextResponse.redirect(
      new URL(`/room/${data.roomCode}`, request.url)
    );
  } catch (error) {
    console.error("[ArcadeKit] Create room GET error:", error);
    return NextResponse.redirect(new URL(`/games/${gameId}`, request.url));
  }
}
