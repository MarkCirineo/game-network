// ============================================================
// ArcadeKit — Rule Out Packs API
// GET /api/packs — every board pack with this viewer's status
//     (unlocked / sign-in / buy). Works signed out.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { packsFor } from "@/lib/packs";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  try {
    return NextResponse.json(
      { signedIn: session !== null, packs: await packsFor(session?.user.id ?? null) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[packs]", error);
    return NextResponse.json({ error: "Couldn't load packs. Try again in a moment." }, { status: 500 });
  }
}
