// ============================================================
// ArcadeKit — Pack Pass API
// POST /api/packs/pass — { board, roomCode } → { pass }
// The host's browser asks for a pass right before starting a Rule
// Out game on a pack that needs an account or a purchase. The game
// server only starts the game with a valid pass (shared/packPass.ts).
// Free packs need no pass.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ownedPackIds, packStatus } from "@/lib/packs";
import { getPack } from "../../../../../shared/boards/packs";
import { createPackPass } from "../../../../../shared/packPass";
import { isCompleteRoomCode } from "../../../../../shared/roomCode";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  let body: { board?: unknown; roomCode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const pack = getPack(body.board);
  const roomCode = typeof body.roomCode === "string" ? body.roomCode.toUpperCase() : "";
  if (!pack || !isCompleteRoomCode(roomCode)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session && pack.access !== "free") {
    return NextResponse.json(
      { error: `Sign in to play the ${pack.name} pack.`, status: "sign-in" },
      { status: 401, headers: noStore },
    );
  }

  try {
    const owned = session ? await ownedPackIds(session.user.id) : new Set<string>();
    const status = packStatus(pack, session !== null, owned);
    if (status !== "unlocked") {
      return NextResponse.json(
        { error: `Unlock the ${pack.name} pack to play it.`, status },
        { status: 403, headers: noStore },
      );
    }
    return NextResponse.json({ pass: createPackPass(pack.id, roomCode) }, { headers: noStore });
  } catch (error) {
    console.error("[packs/pass]", error);
    return NextResponse.json({ error: "Couldn't start the pack. Try again in a moment." }, { status: 500 });
  }
}
