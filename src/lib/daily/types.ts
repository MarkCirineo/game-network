// ============================================================
// ArcadeKit — Daily Rank: API shapes (safe for the browser)
// What the server sends. Answers only appear in a RoundReveal,
// which the server sends after the round is locked in.
// ============================================================

import type { ThemeId } from "./config";
import type { ItemMark } from "./scoring";

export interface PublicItem {
  id: string;
  name: string;
  emoji?: string;
  detail?: string;
}

export interface PublicRound {
  theme: ThemeId;
  categoryId: string;
  title: string;
  top: string;
  bottom: string;
  /** In the order the player first sees them */
  items: PublicItem[];
}

export interface RevealItem extends PublicItem {
  /** The value, formatted for display ("8,849 m") */
  value: string;
  source: string;
}

export interface RoundReveal {
  /** The correct order, top first */
  answer: RevealItem[];
  /** The player's order */
  guess: string[];
  /** Marks for the player's order, position by position */
  marks: ItemMark[];
  score: number;
  credit: string;
}

export interface DaySummary {
  score: number;
  /** Completed plays today, including this one */
  players: number;
  /** % of other players this score beat; null until there are others */
  beatPercent: number | null;
  /** Count of players at each score, index = score (0–30) */
  distribution: number[];
}

export interface DailyState {
  puzzle: number;
  date: string;
  token: string;
  rounds: PublicRound[];
  /** One per round already locked in */
  reveals: RoundReveal[];
  summary: DaySummary | null;
  signedIn: boolean;
}

/** One finished day, as kept in the browser and returned by /api/daily/me */
export interface HistoryEntry {
  puzzle: number;
  token?: string;
  score: number;
  themes: ThemeId[];
  marks: ItemMark[][];
}
