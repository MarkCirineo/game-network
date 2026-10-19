// ============================================================
// ArcadeKit — Daily Rank: settings (safe for the browser)
// The game's name lives here only, so renaming it is a one-line
// change (plus the /daily route folder if the URL should change).
// ============================================================

export const DAILY_GAME_NAME = "Daily Rank";
export const DAILY_PATH = "/daily";
export const DAILY_TAGLINE = "Five things, one question: put them in order.";

/**
 * The day of puzzle #1 (launch day). Every puzzle number counts from
 * here, so never change it once the game is live.
 */
export const DAILY_FIRST_DATE = "2026-10-18";

export const ROUNDS_PER_DAY = 3;
export const ITEMS_PER_ROUND = 5;
/** 2 points per item placed exactly, 1 if one spot away */
export const MAX_ROUND_SCORE = ITEMS_PER_ROUND * 2;
export const MAX_DAY_SCORE = ROUNDS_PER_DAY * MAX_ROUND_SCORE;

export type ThemeId = "world" | "animals" | "nature" | "built" | "history" | "space" | "food";

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  world: { id: "world", name: "World", emoji: "🌍" },
  animals: { id: "animals", name: "Animals", emoji: "🐾" },
  /** Mountains, rivers, lakes: held back for a future geography pack */
  nature: { id: "nature", name: "Nature", emoji: "🏔️" },
  built: { id: "built", name: "Built", emoji: "🏛️" },
  history: { id: "history", name: "History", emoji: "💡" },
  space: { id: "space", name: "Space", emoji: "🪐" },
  food: { id: "food", name: "Food", emoji: "🍎" },
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" → days since 1970-01-01, ignoring time zones */
function dayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** The player's own calendar date, "YYYY-MM-DD" */
export function localDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Puzzle number for a calendar date (#1 on DAILY_FIRST_DATE) */
export function puzzleNumberForDate(date: string): number {
  return dayIndex(date) - dayIndex(DAILY_FIRST_DATE) + 1;
}

export function dateForPuzzle(puzzle: number): string {
  const ms = (dayIndex(DAILY_FIRST_DATE) + puzzle - 1) * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}
