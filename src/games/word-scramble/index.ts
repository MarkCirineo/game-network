// ============================================================
// Word Scramble — Game Definition (module entry point)
// ============================================================

import type { GameDefinition } from '@/games/types';
import type { WordScrambleState, WordScrambleAction } from './types';
import WordScrambleGame from './WordScrambleGame';

export { type WordScrambleState, type WordScrambleAction, type Theme, type GameMode } from './types';
export { scrambleWord, isCorrectGuess, getThemeMeta } from './logic';

const wordScramble: GameDefinition<WordScrambleState, WordScrambleAction> = {
  id: 'word-scramble',
  name: 'Word Scramble',
  description:
    'Race to unscramble words before your friends! Choose from themed categories and be the first to figure out the scrambled word.',
  shortDescription: 'Unscramble words faster than your friends',
  emoji: '🔤',
  category: 'party',
  tags: ['party', 'word', 'multiplayer', 'fast-paced'],
  minPlayers: 2,
  maxPlayers: 8,
  supportsSpectators: true,
  estimatedDuration: '3–5 min',
  component: WordScrambleGame,
  accentColor: '#8B5CF6',
  rules: [
    'A scrambled word is shown to all players at the same time.',
    'Type your guess and press Enter — unlimited attempts, no penalty.',
    'The first player to type the correct word scores a point.',
    'Each round has a 30-second time limit.',
    'Choose from themed categories: Animals, Food, Countries, Sports, Science, Entertainment.',
    'Play fixed rounds or first to a target score.',
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
      key: 'gameMode',
      label: 'Game Mode',
      type: 'select',
      options: [
        { label: '5 Rounds', value: 'rounds_5' },
        { label: '10 Rounds', value: 'rounds_10' },
        { label: '15 Rounds', value: 'rounds_15' },
        { label: 'First to 3', value: 'firstTo_3' },
        { label: 'First to 5', value: 'firstTo_5' },
        { label: 'First to 10', value: 'firstTo_10' },
      ],
      default: 'rounds_5',
    },
  ],
};

export default wordScramble;
