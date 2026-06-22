// ============================================================
// Connect Four — Game Definition (module entry point)
// ============================================================

import type { GameDefinition } from '@/games/types';
import type { ConnectFourState, ConnectFourAction } from './types';
import ConnectFourGame from './ConnectFourGame';

export { type ConnectFourState, type ConnectFourAction } from './types';
export { COLS, ROWS, BOARD_SIZE } from './types';
export { checkWinner, isDraw, isValidMove, isColumnPlayable, getLowestEmptyRow, WINNING_LINES } from './logic';

const connectFour: GameDefinition<ConnectFourState, ConnectFourAction> = {
  id: 'connect-four',
  name: 'Connect Four',
  description:
    'The classic disc-dropping strategy game. Take turns dropping colored discs into a 7-column grid — connect four in a row horizontally, vertically, or diagonally to win!',
  shortDescription: 'Drop discs, connect four to win',
  emoji: '🔴',
  category: 'strategy',
  tags: ['classic', 'strategy', 'two-player', 'turn-based', 'grid'],
  minPlayers: 2,
  maxPlayers: 2,
  supportsSpectators: true,
  estimatedDuration: '2–5 min',
  component: ConnectFourGame,
  accentColor: '#EF4444',
  rules: [
    'Players take turns dropping a disc into one of the 7 columns.',
    'Discs fall to the lowest available position in the chosen column.',
    'The first player to connect 4 discs in a row (horizontally, vertically, or diagonally) wins.',
    'If all 42 cells are filled with no winner, the game is a draw.',
    'Red always goes first.',
  ],
};

export default connectFour;
