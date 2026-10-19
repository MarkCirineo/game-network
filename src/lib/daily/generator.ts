// ============================================================
// ArcadeKit — Daily Rank: puzzle generator (server only)
// Puzzle number in, three rounds out. Same number and same category
// lists → same puzzle. The random numbers are keyed by
// DAILY_SEED_SECRET, so the public code alone can't work out
// tomorrow's answers. Generated puzzles are saved (./puzzles.ts) and
// self-contained, so later changes to categories never change a
// puzzle someone has already seen.
//
// Day by day:
//   1. Categories: 3, from 3 different themes. Every category is
//      equally likely, and one used in the last few days sits out.
//   2. Items: 5 well-known items, all far enough apart (the
//      category's gap rule), shown in a shuffled order.
// ============================================================

import { createHmac } from "node:crypto";
import { ITEMS_PER_ROUND, ROUNDS_PER_DAY, type ThemeId } from "./config";
import { DAILY_CATEGORIES, farEnoughApart, type DailyCategory, type DailyItem } from "./categories";

/** An item as saved with a puzzle */
export interface PuzzleItem {
  id: string;
  name: string;
  emoji?: string;
  detail?: string;
  value: number;
  /** The value formatted for the reveal ("8,849 m") */
  display: string;
  source: string;
}

export interface PuzzleRound {
  theme: ThemeId;
  categoryId: string;
  title: string;
  top: string;
  bottom: string;
  credit: string;
  /** The order the player first sees */
  shown: PuzzleItem[];
  /** Item ids in the correct order (top first) */
  answer: string[];
}

export interface Puzzle {
  number: number;
  rounds: PuzzleRound[];
}

// ---------------- Seeded random numbers ----------------

function seedSecret(): string {
  const secret = process.env.DAILY_SEED_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("DAILY_SEED_SECRET is not set");
  }
  return "dev-only-daily-seed";
}

type Random = () => number;

/** sfc32, seeded from an HMAC of the label */
function random(label: string): Random {
  const hash = createHmac("sha256", seedSecret()).update(label).digest();
  let a = hash.readUInt32LE(0);
  let b = hash.readUInt32LE(4);
  let c = hash.readUInt32LE(8);
  let d = hash.readUInt32LE(12);
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: readonly T[], rand: Random): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------- Categories ----------------

/** A category used on any of the last few days sits out */
const REST_DAYS = 4;

interface DayPlan {
  categories: DailyCategory[];
}

/**
 * Plans are worked out from puzzle #1 forward (each day depends on
 * the days before), then kept in memory. A few thousand days is
 * nothing, so this never needs a database.
 */
const plans: DayPlan[] = [];

/**
 * Every category is equally likely, so each one gets about the same
 * airtime (and a theme with more categories turns up more often).
 * The day's three must be from different themes, and categories from
 * the last REST_DAYS days are skipped while there are others to use.
 */
function pickCategories(day: number): DailyCategory[] {
  const rand = random(`categories:${day}`);
  const recent = new Set(plans.slice(Math.max(0, day - 1 - REST_DAYS), day - 1).flatMap((p) => p.categories));
  const rested = shuffle(DAILY_CATEGORIES.filter((c) => !recent.has(c)), rand);
  const tired = shuffle(DAILY_CATEGORIES.filter((c) => recent.has(c)), rand);

  const picked: DailyCategory[] = [];
  for (const category of [...rested, ...tired]) {
    if (picked.some((p) => p.theme === category.theme)) continue;
    picked.push(category);
    if (picked.length === ROUNDS_PER_DAY) break;
  }
  return picked;
}

function planFor(day: number): DayPlan {
  while (plans.length < day) {
    plans.push({ categories: pickCategories(plans.length + 1) });
  }
  return plans[day - 1];
}

// ---------------- Items ----------------

const MAX_ATTEMPTS = 300;

/**
 * Five items from the category's best-known `pool`, all far enough
 * apart. Better-known items are more likely, but not certain.
 */
function pickItems(category: DailyCategory, rand: Random): DailyItem[] {
  const pool = category.items.slice(0, category.pool);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Weighted shuffle: rank 0 is about twice as likely to come early
    // as the middle of the pool
    const order = pool
      .map((item, rank) => ({ item, key: Math.pow(rand(), 1 / (pool.length * 1.5 - rank)) }))
      .sort((a, b) => b.key - a.key)
      .map((entry) => entry.item);

    const chosen: DailyItem[] = [];
    for (const item of order) {
      if (chosen.every((other) => farEnoughApart(item.value, other.value, category.gap))) {
        chosen.push(item);
        if (chosen.length === ITEMS_PER_ROUND) return chosen;
      }
    }
  }
  throw new Error(`Couldn't find ${ITEMS_PER_ROUND} items far enough apart in ${category.id}`);
}

function answerOrder(category: DailyCategory, items: DailyItem[]): string[] {
  const sorted = [...items].sort((a, b) => (category.order === "desc" ? b.value - a.value : a.value - b.value));
  return sorted.map((item) => item.id);
}

function shownOrder(items: DailyItem[], answer: string[], rand: Random): DailyItem[] {
  // Never start already solved (or exactly backwards)
  for (;;) {
    const shown = shuffle(items, rand);
    const ids = shown.map((item) => item.id).join();
    if (ids !== answer.join() && ids !== [...answer].reverse().join()) return shown;
  }
}

// ---------------- Puzzle ----------------

export function generatePuzzle(number: number): Puzzle {
  if (!Number.isInteger(number) || number < 1) throw new Error(`Bad puzzle number: ${number}`);

  const plan = planFor(number);
  const rounds = plan.categories.map((category, index): PuzzleRound => {
    const rand = random(`items:${number}:${index}`);
    const items = pickItems(category, rand);
    const answer = answerOrder(category, items);
    return {
      theme: category.theme,
      categoryId: category.id,
      title: category.title,
      top: category.top,
      bottom: category.bottom,
      credit: category.credit,
      shown: shownOrder(items, answer, rand).map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        detail: item.detail,
        value: item.value,
        display: category.format(item.value),
        source: item.source,
      })),
      answer,
    };
  });

  return { number, rounds };
}
