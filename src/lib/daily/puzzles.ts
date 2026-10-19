// ============================================================
// ArcadeKit — Daily Rank: saved puzzles (server only)
// The first request for a puzzle generates and saves it; every
// request after that reads the saved copy. See daily_puzzle in
// src/lib/db/schema.ts for why.
// ============================================================

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dailyPuzzle } from "@/lib/db/schema";
import { generatePuzzle, type Puzzle, type PuzzleRound } from "./generator";

const cache = new Map<number, Puzzle>();

export async function loadPuzzle(number: number): Promise<Puzzle> {
  const cached = cache.get(number);
  if (cached) return cached;

  const read = async () => {
    const [row] = await db.select().from(dailyPuzzle).where(eq(dailyPuzzle.puzzle, number)).limit(1);
    return row;
  };

  let row = await read();
  if (!row) {
    const generated = generatePuzzle(number);
    // Two requests at once: whichever saves first wins, the other reads it
    await db.insert(dailyPuzzle).values({ puzzle: number, rounds: generated.rounds }).onConflictDoNothing();
    row = await read();
  }

  const puzzle: Puzzle = { number, rounds: row.rounds as PuzzleRound[] };
  cache.set(number, puzzle);
  return puzzle;
}
