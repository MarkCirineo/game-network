// ============================================================
// ArcadeKit — Room Info API Route
// GET /api/rooms/[roomCode] — fetches room information
// ============================================================

import { NextRequest, NextResponse } from "next/server";

function getGameServerUrl(): string {
  return process.env.GAME_SERVER_INTERNAL_URL || "http://127.0.0.1:3001";
}

type Props = {
  params: Promise<{ roomCode: string }>;
};

export async function GET(_request: NextRequest, { params }: Props) {
  const { roomCode } = await params;

  try {
    const serverUrl = getGameServerUrl();
    const res = await fetch(
      `${serverUrl}/room-info/${roomCode.toUpperCase()}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Game server unavailable" },
      { status: 503 }
    );
  }
}
