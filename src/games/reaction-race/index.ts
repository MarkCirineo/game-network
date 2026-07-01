// ============================================================
// Reaction Race — Game Definition (module entry point)
// ============================================================

import type { GameDefinition } from '@/games/types';
import type { ReactionRaceState, ReactionRaceAction } from './types';
import ReactionRaceGame from './ReactionRaceGame';

export { type ReactionRaceState, type ReactionRaceAction, type RacePhase, type GameMode } from './types';

const reactionRace: GameDefinition<ReactionRaceState, ReactionRaceAction> = {
  id: 'reaction-race',
  name: 'Reaction Race',
  description:
    'A fast-paced reaction time game. Wait for the screen to turn green, then click as fast as you can! Fastest reaction wins the round. But click too early and you get a false start!',
  shortDescription: 'Test your reflexes against your friends',
  emoji: '⚡',
  category: 'party',
  tags: ['party', 'reflex', 'multiplayer', 'fast-paced'],
  minPlayers: 2,
  maxPlayers: 8,
  supportsSpectators: true,
  estimatedDuration: '2–3 min',
  component: ReactionRaceGame,
  accentColor: '#22C55E',
  rules: [
    'Wait for the screen to turn green before clicking.',
    'Click or press Space as fast as you can when you see "GO!".',
    'Fastest reaction time wins the round and scores a point.',
    'Clicking before the green signal is a false start — you miss that round.',
    'Play fixed rounds or first to a target score.',
  ],
  optionsSchema: [
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

export default reactionRace;
