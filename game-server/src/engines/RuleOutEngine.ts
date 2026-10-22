// ============================================================
// ArcadeKit — Rule Out Engine
// Two-player face-guessing game. Each player gets a secret card
// from the same board; players rule out cards by asking yes/no
// questions, then make one final guess. A wrong guess loses.
// Uses getPlayerView() to hide the opponent's secret card.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';
import type { GameOptionSchema } from '../../../shared/gameOptions.js';
import { getBoard, DEFAULT_BOARD_ID } from '../../../shared/boards/index.js';
import { getPack } from '../../../shared/boards/packs.js';
import { verifyPackPass } from '../../../shared/packPass.js';
import {
  normalizeQuestion,
  RULE_OUT_MAX_HISTORY,
  type RuleOutAction,
  type RuleOutMode,
  type RuleOutState,
} from '../../../shared/ruleOut.js';

/** Viewer ID the room uses for spectators (matches no player) */
const SPECTATOR_ID = '__spectator__';

function opponentOf(s: RuleOutState, playerId: string): string {
  return s.players[0] === playerId ? s.players[1] : s.players[0];
}

function hasCard(s: RuleOutState, cardId: unknown): cardId is string {
  return typeof cardId === 'string' && s.board.cards.some((c) => c.id === cardId);
}

function cardName(s: RuleOutState, cardId: string): string {
  return s.board.cards.find((c) => c.id === cardId)?.name ?? 'Unknown';
}

export class RuleOutEngine extends GameEngine {
  readonly name = 'Rule Out';
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  getDefaultOptions(): Record<string, unknown> {
    return { mode: 'free', board: DEFAULT_BOARD_ID };
  }

  getOptionsSchema(): GameOptionSchema[] {
    return [
      {
        key: 'mode',
        label: 'Questions',
        type: 'select',
        options: [
          { label: '🗣️ Ask out loud', value: 'free' },
          { label: '💬 Take turns in the app', value: 'questions' },
        ],
        default: 'free',
      },
    ];
  }

  /**
   * Boards outside the free packs need a pass the site signed for this
   * board in this room (see shared/packPass.ts). The pass is dropped
   * from the kept options; unknown boards fall back to the default.
   */
  checkStartOptions(
    options: Record<string, unknown>,
    roomCode: string,
  ): { ok: true; options: Record<string, unknown> } | { ok: false; message: string } {
    const { boardPass, ...rest } = options;
    const pack = getPack(rest.board);
    if (!pack) return { ok: true, options: { ...rest, board: DEFAULT_BOARD_ID } };
    if (pack.access === 'free' || verifyPackPass(boardPass, pack.id, roomCode)) {
      return { ok: true, options: rest };
    }
    return { ok: false, message: `The host can't use the ${pack.name} pack. Pick another board.` };
  }

  createInitialState(players: PlayerInfo[], options?: Record<string, unknown>): RuleOutState {
    const board = getBoard(options?.board);
    const mode: RuleOutMode = options?.mode === 'questions' ? 'questions' : 'free';
    const ids: [string, string] = [players[0].id, players[1].id];

    // Two different secret cards
    const first = Math.floor(Math.random() * board.cards.length);
    let second = Math.floor(Math.random() * (board.cards.length - 1));
    if (second >= first) second += 1;

    const playerNames: Record<string, string> = {};
    for (const p of players) playerNames[p.id] = p.name;

    return {
      phase: 'playing',
      mode,
      board: {
        id: board.id,
        name: board.name,
        cards: board.cards,
        questions: board.questions ?? [],
      },
      players: ids,
      playerNames,
      secrets: {
        [ids[0]]: board.cards[first].id,
        [ids[1]]: board.cards[second].id,
      },
      ruledOut: { [ids[0]]: [], [ids[1]]: [] },
      remaining: { [ids[0]]: board.cards.length, [ids[1]]: board.cards.length },
      currentTurn: mode === 'questions' ? ids[Math.random() < 0.5 ? 0 : 1] : '',
      pendingQuestion: null,
      history: [],
      result: null,
    };
  }

  validateAction(state: unknown, action: unknown, playerId: string): boolean {
    const s = state as RuleOutState;
    const a = action as RuleOutAction;

    if (s.phase !== 'playing') return false;
    if (!s.players.includes(playerId)) return false;
    if (!a || typeof a !== 'object') return false;

    switch (a.type) {
      case 'toggle':
        return hasCard(s, a.cardId);

      case 'ask':
        return (
          s.mode === 'questions' &&
          s.currentTurn === playerId &&
          s.pendingQuestion === null &&
          typeof a.text === 'string' &&
          normalizeQuestion(a.text).length > 0
        );

      case 'answer':
        return (
          s.pendingQuestion !== null &&
          s.pendingQuestion.askerId !== playerId &&
          (a.answer === 'yes' || a.answer === 'no')
        );

      case 'guess':
        if (!hasCard(s, a.cardId)) return false;
        // In questions mode a guess takes your turn, and can't interrupt
        // a question waiting for an answer
        if (s.mode === 'questions') {
          return s.currentTurn === playerId && s.pendingQuestion === null;
        }
        return true;

      default:
        return false;
    }
  }

  applyAction(state: unknown, action: unknown, playerId: string): RuleOutState {
    const s = state as RuleOutState;
    const a = action as RuleOutAction;

    switch (a.type) {
      case 'toggle': {
        const current = s.ruledOut[playerId] ?? [];
        const next = current.includes(a.cardId)
          ? current.filter((id) => id !== a.cardId)
          : [...current, a.cardId];
        return {
          ...s,
          ruledOut: { ...s.ruledOut, [playerId]: next },
          remaining: { ...s.remaining, [playerId]: s.board.cards.length - next.length },
        };
      }

      case 'ask':
        return {
          ...s,
          pendingQuestion: { askerId: playerId, text: normalizeQuestion(a.text), answer: null },
        };

      case 'answer': {
        const answered = { ...s.pendingQuestion!, answer: a.answer };
        return {
          ...s,
          pendingQuestion: null,
          history: [...s.history, answered].slice(-RULE_OUT_MAX_HISTORY),
          // Asking used the asker's turn — it passes to the answerer
          currentTurn: playerId,
        };
      }

      case 'guess': {
        const opponentId = opponentOf(s, playerId);
        const correct = s.secrets[opponentId] === a.cardId;
        return {
          ...s,
          phase: 'finished',
          currentTurn: '',
          pendingQuestion: null,
          result: {
            guesserId: playerId,
            guessedCardId: a.cardId,
            correct,
            winnerId: correct ? playerId : opponentId,
          },
        };
      }

      default:
        return s;
    }
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as RuleOutState;
    if (s.phase !== 'finished' || !s.result) return { isOver: false };

    const { guesserId, guessedCardId, correct, winnerId } = s.result;
    const guesser = s.playerNames[guesserId] ?? 'Unknown';
    const guessed = cardName(s, guessedCardId);
    const actual = cardName(s, s.secrets[opponentOf(s, guesserId)]);

    return {
      isOver: true,
      winnerId,
      reason: correct
        ? `${guesser} guessed ${guessed}. Correct!`
        : `${guesser} guessed ${guessed}, but it was ${actual}.`,
    };
  }

  /**
   * Hide hidden information:
   * - Secret cards: you see only your own until the game ends.
   * - Ruled-out cards: you see only your own (the opponent's count
   *   stays visible through `remaining`).
   * Spectators see neither secret until the game ends.
   */
  getPlayerView(state: unknown, playerId: string): unknown {
    const s = state as RuleOutState;
    const isPlayer = playerId !== SPECTATOR_ID && s.players.includes(playerId);

    const secrets =
      s.phase === 'finished'
        ? s.secrets
        : isPlayer
          ? { [playerId]: s.secrets[playerId] }
          : {};

    const ruledOut = isPlayer ? { [playerId]: s.ruledOut[playerId] ?? [] } : {};

    return { ...s, secrets, ruledOut };
  }
}
