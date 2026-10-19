// ============================================================
// ArcadeKit — Daily Rank: shared bits for the API routes (server only)
// ============================================================

import { NextResponse } from "next/server";
import { DailyError } from "./plays";

/** httpOnly cookie holding a guest's play token for today */
export const DAILY_PLAY_COOKIE = "daily_play";

export function dailyErrorResponse(error: unknown): NextResponse {
  if (error instanceof DailyError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[daily]", error);
  return NextResponse.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
}
