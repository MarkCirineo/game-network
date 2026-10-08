// ============================================================
// Hangman — Game Definition (module entry point)
// ============================================================

import type { GameDefinition } from '@/games/types';
import type { HangmanState, HangmanAction } from './types';
import HangmanGame from './HangmanGame';

export { type HangmanState, type HangmanAction, type Theme } from './types';
export { getThemeMeta, letterStatus, visibleParts, ALPHABET } from './logic';

const hangman: GameDefinition<HangmanState, HangmanAction> = {
  id: 'hangman',
  name: 'Hangman',
  description:
    'The classic word-guessing game, multiplayer. Take turns guessing letters on a shared gallows — score for every letter you reveal, risk a full-word solve for big points, and don\'t let the hangman finish!',
  shortDescription: 'Guess letters, dodge the gallows, solve the word',
  emoji: '🪢',
  category: 'word',
  tags: ['classic', 'word', 'multiplayer', 'turn-based'],
  minPlayers: 2,
  maxPlayers: 8,
  supportsSpectators: true,
  estimatedDuration: '5–10 min',
  component: HangmanGame,
  accentColor: '#F59E0B',
  rules: [
    'Everyone guesses the same hidden word — players take turns picking letters.',
    'Correct letter: +10 points per appearance, and you keep your turn.',
    'Wrong letter: a strike is added to the shared gallows and your turn passes.',
    'On your turn you can try to solve the whole word: +20 points per hidden letter if right, a strike and your turn if wrong.',
    'Revealing the final letter earns a +20 completion bonus.',
    'If the gallows fills up (6, 8, or 10 strikes), the round ends with no winner.',
    'Most points after all rounds wins the match.',
  ],
  optionsSchema: [
    {
      key: 'theme',
      label: 'Theme',
      type: 'select',
      options: [
        { label: '🎲 Random', value: 'random' },
        { label: '🐾 Animals', value: 'animals' },
        { label: '🍕 Food', value: 'food' },
        { label: '🌍 Countries', value: 'countries' },
        { label: '⚽ Sports', value: 'sports' },
        { label: '🔬 Science', value: 'science' },
        { label: '🎬 Entertainment', value: 'entertainment' },
      ],
      default: 'random',
    },
    {
      key: 'rounds',
      label: 'Rounds',
      type: 'select',
      options: [
        { label: '3 Rounds', value: 3 },
        { label: '5 Rounds', value: 5 },
        { label: '10 Rounds', value: 10 },
      ],
      default: 5,
    },
    {
      key: 'maxStrikes',
      label: 'Strikes',
      type: 'select',
      options: [
        { label: '6 Strikes (classic)', value: 6 },
        { label: '8 Strikes', value: 8 },
        { label: '10 Strikes (forgiving)', value: 10 },
      ],
      default: 6,
    },
  ],
};

export default hangman;
