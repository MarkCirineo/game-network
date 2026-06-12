// ============================================================
// Rock Paper Scissors — Game Definition (module entry point)
// ============================================================

import type { GameDefinition } from '@/games/types';
import type { RPSState, RPSAction } from './types';
import RockPaperScissorsGame from './RockPaperScissorsGame';

export { type RPSState, type RPSAction, type RPSChoice } from './types';
export { determineWinner, getChoiceEmoji, getResultText } from './logic';

const rockPaperScissors: GameDefinition<RPSState, RPSAction> = {
  id: 'rock-paper-scissors',
  name: 'Rock Paper Scissors',
  description:
    'The ultimate showdown of wits and luck. Choose rock, paper, or scissors — play best-of-three rounds to settle the score.',
  shortDescription: 'Quick-fire hand game showdown',
  emoji: '✊',
  category: 'quick',
  tags: ['classic', 'quick', 'two-player', 'simultaneous', 'luck'],
  minPlayers: 2,
  maxPlayers: 2,
  supportsSpectators: true,
  estimatedDuration: '< 1 min',
  component: RockPaperScissorsGame,
  accentColor: '#F97316',
  rules: [
    'Both players choose rock, paper, or scissors simultaneously.',
    'Rock beats scissors, scissors beats paper, paper beats rock.',
    'If both players choose the same, the round is a tie.',
    'The player who wins the most rounds out of three wins the match.',
  ],
};

export default rockPaperScissors;
