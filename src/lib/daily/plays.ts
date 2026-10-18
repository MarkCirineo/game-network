// ============================================================
// ArcadeKit — Daily Rank: plays (server only)
// Starting a play, grading a round, today's percentile, and
// attaching guest plays to an account after sign-in.
//
// Every play is graded here, guests included: the browser never
// sees a round's answer until that round is locked in, and a round
// can't be played twice on the same play.
// ============================================================

import { and, asc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { dailyPlay } from "@/lib/db/schema";
import { MAX_DAY_SCORE, dateForPuzzle, puzzleNumberForDate, ROUNDS_PER_DAY } from "./config";
import type { PuzzleRound } from "./generator";
import { loadPuzzle } from "./puzzles";
import { markGuess, sumMarks, type ItemMark } from "./scoring";
import type { DailyState, DaySummary, HistoryEntry, PublicRound, RoundReveal } from "./types";

type PlayRow = typeof dailyPlay.$inferSelect;

export class DailyError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// ---------------- Which puzzle is "today" ----------------

const HOUR_MS = 60 * 60 * 1000;

/**
 * True if `date` is today somewhere on Earth (UTC−12 to UTC+14), so
 * nobody can open tomorrow's puzzle early.
 */
export function isPlayableDate(date: string, now: Date = new Date()): boolean {
  const earliest = new Date(now.getTime() - 12 * HOUR_MS).toISOString().slice(0, 10);
  const latest = new Date(now.getTime() + 14 * HOUR_MS).toISOString().slice(0, 10);
  return date >= earliest && date <= latest && puzzleNumberForDate(date) >= 1;
}

// ---------------- Shaping rounds for the browser ----------------

function publicRound(round: PuzzleRound): PublicRound {
  return {
    theme: round.theme,
    categoryId: round.categoryId,
    title: round.title,
    top: round.top,
    bottom: round.bottom,
    items: round.shown.map(({ id, name, emoji, detail }) => ({ id, name, emoji, detail })),
  };
}

function reveal(round: PuzzleRound, guess: string[], marks: ItemMark[]): RoundReveal {
  const byId = new Map(round.shown.map((item) => [item.id, item]));
  return {
    answer: round.answer.map((id) => {
      const item = byId.get(id)!;
      return {
        id,
        name: item.name,
        emoji: item.emoji,
        detail: item.detail,
        value: item.display,
        source: item.source,
      };
    }),
    guess,
    marks,
    score: sumMarks(marks),
    credit: round.credit,
  };
}

// ---------------- Percentiles ----------------

export async function daySummary(puzzle: number, score: number): Promise<DaySummary> {
  const rows = await db
    .select({ score: dailyPlay.score, count: sql<number>`count(*)::int` })
    .from(dailyPlay)
    .where(and(eq(dailyPlay.puzzle, puzzle), isNotNull(dailyPlay.completedAt)))
    .groupBy(dailyPlay.score);

  const distribution = Array.from({ length: MAX_DAY_SCORE + 1 }, () => 0);
  for (const row of rows) distribution[row.score] = row.count;

  const players = distribution.reduce((total, count) => total + count, 0);
  const below = distribution.slice(0, score).reduce((total, count) => total + count, 0);
  // Other players on the same score count as half beaten
  const tied = Math.max(0, distribution[score] - 1);
  const others = players - 1;
  return {
    score,
    players,
    beatPercent: others > 0 ? Math.round(((below + tied / 2) / others) * 100) : null,
    distribution,
  };
}

// ---------------- Loading and starting plays ----------------

async function findPlay(token: string | undefined): Promise<PlayRow | undefined> {
  if (!token) return undefined;
  const [row] = await db.select().from(dailyPlay).where(eq(dailyPlay.id, token)).limit(1);
  return row;
}

async function stateFor(row: PlayRow, signedIn: boolean): Promise<DailyState> {
  const puzzle = await loadPuzzle(row.puzzle);
  return {
    puzzle: row.puzzle,
    date: dateForPuzzle(row.puzzle),
    token: row.id,
    rounds: puzzle.rounds.map(publicRound),
    reveals: row.rounds.map((done, index) => reveal(puzzle.rounds[index], done.guess, done.marks as ItemMark[])),
    summary: row.completedAt ? await daySummary(row.puzzle, row.score) : null,
    signedIn,
  };
}

/**
 * Today's play for this visitor: their account's play if signed in,
 * otherwise the guest play in their cookie, otherwise a new one.
 * A guest play from earlier today joins the account on sign-in.
 */
export async function openPlay(options: {
  date: string;
  userId: string | null;
  cookieToken: string | undefined;
}): Promise<DailyState> {
  if (!isPlayableDate(options.date)) throw new DailyError("That puzzle isn't available.", 400);
  const puzzle = puzzleNumberForDate(options.date);
  const { userId } = options;

  const cookiePlay = await findPlay(options.cookieToken);
  const guestPlay =
    cookiePlay && cookiePlay.puzzle === puzzle && (cookiePlay.userId === null || cookiePlay.userId === userId)
      ? cookiePlay
      : undefined;

  if (userId) {
    const [own] = await db
      .select()
      .from(dailyPlay)
      .where(and(eq(dailyPlay.userId, userId), eq(dailyPlay.puzzle, puzzle)))
      .limit(1);
    if (own) return stateFor(own, true);
    if (guestPlay) {
      const [claimed] = await db
        .update(dailyPlay)
        .set({ userId })
        .where(and(eq(dailyPlay.id, guestPlay.id), isNull(dailyPlay.userId)))
        .returning();
      if (claimed) return stateFor(claimed, true);
    }
  } else if (guestPlay) {
    return stateFor(guestPlay, false);
  }

  await loadPuzzle(puzzle); // fail before writing anything if the puzzle can't be built
  const [created] = await db
    .insert(dailyPlay)
    .values({ id: nanoid(24), puzzle, userId })
    .onConflictDoNothing()
    .returning();
  if (!created) {
    // Two tabs opened at once: the other one won, so use its play
    return openPlay(options);
  }
  return stateFor(created, Boolean(userId));
}

// ---------------- Grading a round ----------------

export async function submitRound(options: {
  token: string;
  round: number;
  guess: unknown;
  userId: string | null;
}): Promise<{ reveal: RoundReveal; summary: DaySummary | null }> {
  const row = await findPlay(options.token);
  if (!row) throw new DailyError("Play not found.", 404);
  if (row.userId && row.userId !== options.userId) throw new DailyError("That play belongs to another account.", 403);
  if (options.round !== row.rounds.length || options.round >= ROUNDS_PER_DAY) {
    throw new DailyError("That round has already been played.", 409);
  }

  const round = (await loadPuzzle(row.puzzle)).rounds[options.round];
  const ids = round.shown.map((item) => item.id);
  const guess = options.guess;
  if (
    !Array.isArray(guess) ||
    guess.length !== ids.length ||
    new Set(guess).size !== ids.length ||
    !guess.every((id) => typeof id === "string" && ids.includes(id))
  ) {
    throw new DailyError("That order doesn't match this round's items.", 400);
  }

  const marks = markGuess(guess as string[], round.answer);
  const rounds = [...row.rounds, { guess: guess as string[], marks }];
  const score = row.score + sumMarks(marks);
  const complete = rounds.length === ROUNDS_PER_DAY;

  // Only succeeds if nobody else saved this round first (double click,
  // two tabs): the stored round count must still be what we read
  const [saved] = await db
    .update(dailyPlay)
    .set({ rounds, score, completedAt: complete ? new Date() : null })
    .where(and(eq(dailyPlay.id, row.id), sql`jsonb_array_length(${dailyPlay.rounds}) = ${options.round}`))
    .returning({ id: dailyPlay.id });
  if (!saved) throw new DailyError("That round has already been played.", 409);

  return {
    reveal: reveal(round, guess as string[], marks),
    summary: complete ? await daySummary(row.puzzle, score) : null,
  };
}

// ---------------- Accounts ----------------

/**
 * Attach finished guest plays (tokens kept in the browser) to an
 * account. Skips plays already owned by someone and puzzles the
 * account already has, so the account's own record always wins.
 */
export async function claimGuestPlays(userId: string, tokens: string[]): Promise<number> {
  const unique = [...new Set(tokens.filter((t) => typeof t === "string" && t.length <= 64))].slice(0, 400);
  if (unique.length === 0) return 0;

  const owned = await db
    .select({ puzzle: dailyPlay.puzzle })
    .from(dailyPlay)
    .where(eq(dailyPlay.userId, userId));
  const ownedPuzzles = new Set(owned.map((row) => row.puzzle));

  const guests = await db
    .select({ id: dailyPlay.id, puzzle: dailyPlay.puzzle })
    .from(dailyPlay)
    .where(and(inArray(dailyPlay.id, unique), isNull(dailyPlay.userId), isNotNull(dailyPlay.completedAt)))
    .orderBy(asc(dailyPlay.startedAt));

  const toClaim: string[] = [];
  for (const play of guests) {
    if (ownedPuzzles.has(play.puzzle)) continue;
    ownedPuzzles.add(play.puzzle);
    toClaim.push(play.id);
  }
  if (toClaim.length === 0) return 0;

  const claimed = await db
    .update(dailyPlay)
    .set({ userId })
    .where(and(inArray(dailyPlay.id, toClaim), isNull(dailyPlay.userId)))
    .returning({ id: dailyPlay.id });
  return claimed.length;
}

/** An account's finished days, oldest first */
export async function accountHistory(userId: string): Promise<HistoryEntry[]> {
  const rows = await db
    .select()
    .from(dailyPlay)
    .where(and(eq(dailyPlay.userId, userId), isNotNull(dailyPlay.completedAt)))
    .orderBy(asc(dailyPlay.puzzle));

  return Promise.all(
    rows.map(async (row) => ({
      puzzle: row.puzzle,
      score: row.score,
      themes: (await loadPuzzle(row.puzzle)).rounds.map((round) => round.theme),
      marks: row.rounds.map((round) => round.marks as ItemMark[]),
    })),
  );
}
