// ============================================================
// ArcadeKit — Daily Rank: scoring (safe for the browser)
// Each item scores on how far it is from its real spot:
//   right spot 2 (🟩), one spot away 1 (🟨), further 0 (⬜).
// ============================================================

import { DAILY_GAME_NAME, MAX_DAY_SCORE, THEMES, type ThemeId } from "./config";

export type ItemMark = 0 | 1 | 2;

/** Points for each guessed position, in the order the player guessed */
export function markGuess(guess: string[], answer: string[]): ItemMark[] {
  return guess.map((id, guessIndex) => {
    const distance = Math.abs(answer.indexOf(id) - guessIndex);
    return distance === 0 ? 2 : distance === 1 ? 1 : 0;
  });
}

export const sumMarks = (marks: ItemMark[]): number => marks.reduce<number>((total, mark) => total + mark, 0);

const MARK_EMOJI: Record<ItemMark, string> = { 2: "🟩", 1: "🟨", 0: "⬜" };

export const marksToGrid = (marks: ItemMark[]): string => marks.map((mark) => MARK_EMOJI[mark]).join("");

export interface ShareRound {
  theme: ThemeId;
  marks: ItemMark[];
}

export function shareText(options: {
  puzzle: number;
  score: number;
  topPercent?: number | null;
  rounds: ShareRound[];
  url: string;
}): string {
  const top = options.topPercent ? ` (top ${options.topPercent}%)` : "";
  const lines = options.rounds.map((round) => {
    const theme = THEMES[round.theme];
    return `${theme.emoji} ${marksToGrid(round.marks)}`;
  });
  return [`${DAILY_GAME_NAME} #${options.puzzle}: ${options.score}/${MAX_DAY_SCORE}${top}`, ...lines, options.url].join("\n");
}
