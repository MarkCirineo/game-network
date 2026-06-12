// ============================================================
// Tic-Tac-Toe — Game Definition (module entry point)
// ============================================================

import type { GameDefinition } from '@/games/types';
import type { TicTacToeState, TicTacToeAction } from './types';
import TicTacToeGame from './TicTacToeGame';

export { type TicTacToeState, type TicTacToeAction } from './types';
export { checkWinner, isDraw, isValidMove, WINNING_LINES } from './logic';

const ticTacToe: GameDefinition<TicTacToeState, TicTacToeAction> = {
  id: 'tic-tac-toe',
  name: 'Tic-Tac-Toe',
  description:
    'The timeless strategy game. Take turns placing your mark on a 3×3 grid — get three in a row to win. Simple to learn, tricky to master.',
  shortDescription: 'Classic 3-in-a-row strategy',
  emoji: '❌',
  category: 'strategy',
  tags: ['classic', 'strategy', 'two-player', 'quick', 'turn-based'],
  minPlayers: 2,
  maxPlayers: 2,
  supportsSpectators: true,
  estimatedDuration: '1–2 min',
  component: TicTacToeGame,
  accentColor: '#3B82F6',
  rules: [
    'Players take turns placing their mark (X or O) on an empty cell.',
    'The first player to get 3 marks in a row (horizontal, vertical, or diagonal) wins.',
    'If all 9 cells are filled with no winner, the game is a draw.',
    'X always goes first.',
  ],
};

export default ticTacToe;
