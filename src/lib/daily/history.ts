// ============================================================
// ArcadeKit — Daily Rank: history and streaks (browser)
// Guests' finished days live in localStorage. Signed-in players'
// days come from the server (/api/daily/me); the browser copy is
// only used to hand guest plays over to the account.
// ============================================================

import { MAX_DAY_SCORE } from "./config";
import type { HistoryEntry } from "./types";

const HISTORY_KEY = "daily-rank:history:v1";
const PROMPT_SNOOZE_KEY = "daily-rank:signin-snoozed-until";
const PROMPT_SNOOZE_DAYS = 3;

export function readLocalHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((e) => Number.isInteger(e?.puzzle)) : [];
  } catch {
    return [];
  }
}

export function saveLocalEntry(entry: HistoryEntry): HistoryEntry[] {
  const history = readLocalHistory().filter((e) => e.puzzle !== entry.puzzle);
  history.push(entry);
  history.sort((a, b) => a.puzzle - b.puzzle);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Private mode or storage full: the game still works, just no streak
  }
  return history;
}

export interface DailyStats {
  played: number;
  currentStreak: number;
  bestStreak: number;
  average: number | null;
  best: number | null;
  /** How many of your days ended on each score, index = score */
  distribution: number[];
}

/**
 * Streaks count consecutive puzzle numbers. The current streak is
 * still alive if the last one played was today or yesterday.
 */
export function computeStats(history: HistoryEntry[], today: number): DailyStats {
  const puzzles = [...new Set(history.map((e) => e.puzzle))].sort((a, b) => a - b);

  let best = 0;
  let run = 0;
  for (let i = 0; i < puzzles.length; i++) {
    run = i > 0 && puzzles[i] === puzzles[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  let current = 0;
  const last = puzzles[puzzles.length - 1];
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = puzzles.length - 2; i >= 0 && puzzles[i] === puzzles[i + 1] - 1; i--) current++;
  }

  const distribution = Array.from({ length: MAX_DAY_SCORE + 1 }, () => 0);
  for (const entry of history) distribution[entry.score] = (distribution[entry.score] ?? 0) + 1;
  const scores = history.map((e) => e.score);

  return {
    played: puzzles.length,
    currentStreak: current,
    bestStreak: best,
    average: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
    best: scores.length ? Math.max(...scores) : null,
    distribution,
  };
}

export function signInPromptSnoozed(): boolean {
  try {
    return Number(localStorage.getItem(PROMPT_SNOOZE_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

export function snoozeSignInPrompt(): void {
  try {
    localStorage.setItem(PROMPT_SNOOZE_KEY, String(Date.now() + PROMPT_SNOOZE_DAYS * 24 * 60 * 60 * 1000));
  } catch {
    // Nothing to do: the prompt just shows again next time
  }
}
