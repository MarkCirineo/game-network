// ============================================================
// Hangman — Pure Game Logic (no React / DOM deps)
// ============================================================

import { THEMES } from './types';

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

/**
 * Get theme metadata by ID.
 */
export function getThemeMeta(themeId: string): { label: string; emoji: string } {
  const meta = THEMES.find((t) => t.id === themeId);
  return meta ?? { label: 'Random', emoji: '🎲' };
}

/**
 * Classify a guessed letter for keyboard coloring.
 * The masked word contains every correctly guessed letter, so a
 * guessed letter that never appears in it must have been wrong.
 */
export function letterStatus(
  letter: string,
  maskedWord: string,
  guessedLetters: string[],
): 'correct' | 'wrong' | 'unguessed' {
  if (!guessedLetters.includes(letter)) return 'unguessed';
  return maskedWord.includes(letter) ? 'correct' : 'wrong';
}

/**
 * Gallows drawing parts, in draw order. The first parts are the
 * scaffold, the rest are the figure. With fewer allowed strikes,
 * more of the scaffold is pre-drawn (classic 6-strike hangman
 * pre-draws the whole scaffold and hangs one body part per miss).
 */
export const GALLOWS_PART_COUNT = 10;

/**
 * Number of parts visible for a given strike count and limit.
 * Pre-drawn scaffold parts + one part per strike.
 */
export function visibleParts(strikes: number, maxStrikes: number): number {
  const preDrawn = GALLOWS_PART_COUNT - maxStrikes;
  return Math.min(GALLOWS_PART_COUNT, preDrawn + strikes);
}
