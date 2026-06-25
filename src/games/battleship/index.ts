// ============================================================
// Battleship — Game Definition (module entry point)
// ============================================================

import type { GameDefinition } from '@/games/types';
import type { BattleshipState, BattleshipAction } from './types';
import BattleshipGame from './BattleshipGame';

export { type BattleshipState, type BattleshipAction } from './types';
export { GRID_SIZE, TOTAL_CELLS, SHIPS } from './types';
export { validatePlacements, fireAtCell, allShipsSunk, isValidFire } from './logic';

const battleship: GameDefinition<BattleshipState, BattleshipAction> = {
  id: 'battleship',
  name: 'Battleship',
  description:
    'The classic naval combat game. Place your fleet on a hidden grid, then take turns firing at your opponent\'s waters. Sink all 5 enemy ships before they sink yours!',
  shortDescription: 'Sink the enemy fleet',
  emoji: '🚢',
  category: 'strategy',
  tags: ['classic', 'strategy', 'two-player', 'hidden-info', 'naval'],
  minPlayers: 2,
  maxPlayers: 2,
  supportsSpectators: true,
  estimatedDuration: '5–15 min',
  component: BattleshipGame,
  accentColor: '#0EA5E9',
  rules: [
    'Each player secretly places 5 ships on their 10×10 grid: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2).',
    'Ships can be placed horizontally or vertically, but cannot overlap.',
    'Players take turns firing at a cell on their opponent\'s grid.',
    'A hit is marked with fire 🔥, a miss with a dot.',
    'When all cells of a ship are hit, it is sunk.',
    'The first player to sink all 5 enemy ships wins!',
  ],
};

export default battleship;
