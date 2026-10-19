// ============================================================
// ArcadeKit — Daily Rank API
// GET /api/daily?date=YYYY-MM-DD — today's puzzle for this visitor
// (the player's own calendar date). Starts a play, or picks up the
// one already in progress. Guests' play is kept in a cookie so a
// reload doesn't start over.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isDateString } from "@/lib/daily/config";
import { DAILY_PLAY_COOKIE, dailyErrorResponse } from "@/lib/daily/http";
import { openPlay } from "@/lib/daily/plays";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!isDateString(date)) {
    return NextResponse.json({ error: "Missing or invalid date." }, { status: 400 });
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const state = await openPlay({
      date,
      userId: session?.user.id ?? null,
      cookieToken: request.cookies.get(DAILY_PLAY_COOKIE)?.value,
    });

    const response = NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(DAILY_PLAY_COOKIE, state.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 48,
    });
    return response;
  } catch (error) {
    return dailyErrorResponse(error);
  }
}
