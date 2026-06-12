// ============================================================
// ArcadeKit — Room Info API Route
// GET /api/rooms/[roomCode] — fetches room information
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GAME_SERVER_URL } from "@/lib/constants";

type Props = {
  params: Promise<{ roomCode: string }>;
};

export async function GET(_request: NextRequest, { params }: Props) {
  const { roomCode } = await params;

  try {
    const res = await fetch(
      `${GAME_SERVER_URL}/room-info/${roomCode.toUpperCase()}`
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
