// ============================================================
// Word Scramble — Pure Game Logic (no React / DOM deps)
// ============================================================

import type { Theme } from './types';
import { THEMES } from './types';

/**
 * Scramble a word using Fisher-Yates shuffle.
 * Ensures the result is different from the original.
 */
export function scrambleWord(word: string): string {
  const chars = word.toLowerCase().split('');
  let scrambled: string;
  let attempts = 0;

  do {
    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    scrambled = chars.join('');
    attempts++;
    // Safety: if word has all identical letters (e.g., "aaaa"), allow it after 10 tries
  } while (scrambled === word.toLowerCase() && attempts < 10);

  return scrambled;
}

/**
 * Check if a guess matches the answer (case-insensitive, trimmed).
 */
export function isCorrectGuess(guess: string, answer: string): boolean {
  return guess.trim().toLowerCase() === answer.trim().toLowerCase();
}

/**
 * Pick N random unique words from an array.
 */
export function pickRandomWords(words: string[], count: number): string[] {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/**
 * Parse a combined game mode option value like 'rounds_5' or 'firstTo_3'.
 */
export function parseGameMode(value: string): { mode: 'rounds' | 'firstTo'; target: number } {
  const [mode, targetStr] = value.split('_');
  return {
    mode: mode === 'firstTo' ? 'firstTo' : 'rounds',
    target: parseInt(targetStr, 10) || 5,
  };
}

/**
 * Get theme metadata by ID.
 */
export function getThemeMeta(themeId: string): { label: string; emoji: string } {
  const meta = THEMES.find((t) => t.id === themeId);
  return meta ?? { label: 'Random', emoji: '🎲' };
}
