// ============================================================
// ArcadeKit — Daily Rank API (signed-in players)
// GET  /api/daily/me — the account's finished days, for streaks
//      and stats.
// POST /api/daily/me — { tokens: [...] } attaches guest plays from
//      this browser to the account, then returns the history.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dailyErrorResponse } from "@/lib/daily/http";
import { accountHistory, claimGuestPlays } from "@/lib/daily/plays";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    return NextResponse.json({ history: await accountHistory(session.user.id) }, { headers: noStore });
  } catch (error) {
    return dailyErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let tokens: unknown;
  try {
    tokens = (await request.json()).tokens;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!Array.isArray(tokens)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const claimed = await claimGuestPlays(session.user.id, tokens);
    return NextResponse.json({ claimed, history: await accountHistory(session.user.id) }, { headers: noStore });
  } catch (error) {
    return dailyErrorResponse(error);
  }
}
