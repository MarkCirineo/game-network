// ============================================================
// ArcadeKit — Daily Rank API
// POST /api/daily/round — lock in one round.
//   body: { token, round, guess: [item ids, top first] }
// Returns that round's answer and score, plus today's percentile
// after the last round.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dailyErrorResponse } from "@/lib/daily/http";
import { submitRound } from "@/lib/daily/plays";

export async function POST(request: NextRequest) {
  let body: { token?: unknown; round?: unknown; guess?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.token !== "string" || !Number.isInteger(body.round)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const result = await submitRound({
      token: body.token,
      round: body.round as number,
      guess: body.guess,
      userId: session?.user.id ?? null,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return dailyErrorResponse(error);
  }
}
