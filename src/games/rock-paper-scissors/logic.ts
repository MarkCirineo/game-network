// ============================================================
// Rock Paper Scissors — Pure Game Logic (no React / DOM deps)
// ============================================================

import type { RPSChoice } from './types';

/**
 * Determine the winner between two choices.
 * @returns 1 if choice1 wins, 2 if choice2 wins, 0 if tie
 */
export function determineWinner(choice1: RPSChoice, choice2: RPSChoice): 0 | 1 | 2 {
  if (choice1 === choice2) return 0;

  const wins: Record<RPSChoice, RPSChoice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  };

  return wins[choice1] === choice2 ? 1 : 2;
}

/**
 * Get the display emoji for a choice.
 */
export function getChoiceEmoji(choice: RPSChoice): string {
  const emojis: Record<RPSChoice, string> = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️',
  };
  return emojis[choice];
}

/**
 * Get human-readable result text for a round outcome.
 * @param result 0 = tie, 1 = player 1 wins, 2 = player 2 wins
 */
export function getResultText(result: 0 | 1 | 2): string {
  switch (result) {
    case 0:
      return "It's a tie!";
    case 1:
      return 'Player 1 wins the round!';
    case 2:
      return 'Player 2 wins the round!';
  }
}
