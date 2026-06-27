// ============================================================
// ArcadeKit — Word Scramble Engine
// Simultaneous-play word unscrambling game with themed word lists.
// 2–8 players, configurable rounds/first-to mode.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';
import type { GameOptionSchema } from '../../../shared/gameOptions.js';
import { WORD_LISTS } from './wordLists.js';

// ── Types ───────────────────────────────────────────────────

interface WordScrambleState {
  phase: 'playing' | 'reveal' | 'finished';
  round: number;
  gameMode: 'rounds' | 'firstTo';
  target: number;
  theme: string;
  scores: Record<string, number>;
  currentWord: string;
  scrambledWord: string;
  solved: Record<string, boolean>;
  roundStartTime: number;
  roundDurationMs: number;
  lastResult: {
    word: string;
    solverId: string | null;
  } | null;
  players: string[];
  words: string[];
  playerNames: Record<string, string>;
}

interface GuessAction {
  type: 'guess';
  word: string;
}

interface TimeoutAction {
  type: 'timeout';
}

interface NextRoundAction {
  type: 'next_round';
}

type WordScrambleAction = GuessAction | TimeoutAction | NextRoundAction;

// ── Helpers ─────────────────────────────────────────────────

const ROUND_DURATION_MS = 30_000;

/** Fisher-Yates shuffle on characters, ensuring result ≠ original. */
function scrambleWord(word: string): string {
  const chars = word.toLowerCase().split('');
  let scrambled: string;
  let attempts = 0;

  do {
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    scrambled = chars.join('');
    attempts++;
  } while (scrambled === word.toLowerCase() && attempts < 10);

  return scrambled;
}

/** Pick N random unique items from an array. */
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/** Parse combined game mode value like 'rounds_5' or 'firstTo_3'. */
function parseGameMode(value: string): { mode: 'rounds' | 'firstTo'; target: number } {
  const parts = value.split('_');
  const mode = parts[0] === 'firstTo' ? 'firstTo' : 'rounds';
  const target = parseInt(parts[1], 10) || 5;
  return { mode, target };
}

// ── Engine ──────────────────────────────────────────────────

export class WordScrambleEngine extends GameEngine {
  readonly name = 'Word Scramble';
  readonly minPlayers = 2;
  readonly maxPlayers = 8;

  getDefaultOptions(): Record<string, unknown> {
    return { theme: 'random', gameMode: 'rounds_5' };
  }

  getOptionsSchema(): GameOptionSchema[] {
    return [
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
    ];
  }

  createInitialState(
    players: PlayerInfo[],
    options?: Record<string, unknown>,
  ): WordScrambleState {
    const theme = (options?.theme as string) ?? 'random';
    const gameModeStr = (options?.gameMode as string) ?? 'rounds_5';
    const { mode, target } = parseGameMode(gameModeStr);

    // For 'firstTo' mode, pick a generous number of words (target * 3 should be enough)
    // For 'rounds' mode, pick exactly target words
    const wordCount = mode === 'firstTo' ? target * 4 : target;
    const wordList: string[] = WORD_LISTS[theme] ?? WORD_LISTS['random'] ?? [];
    const words: string[] = pickRandom(wordList, Math.min(wordCount, wordList.length));

    const scores: Record<string, number> = {};
    const solved: Record<string, boolean> = {};
    const playerNames: Record<string, string> = {};

    for (const player of players) {
      scores[player.id] = 0;
      solved[player.id] = false;
      playerNames[player.id] = player.name;
    }

    const firstWord: string = words[0] ?? 'word';

    return {
      phase: 'playing',
      round: 1,
      gameMode: mode,
      target,
      theme,
      scores,
      currentWord: firstWord,
      scrambledWord: scrambleWord(firstWord),
      solved,
      roundStartTime: Date.now(),
      roundDurationMs: ROUND_DURATION_MS,
      lastResult: null,
      players: players.map((p) => p.id),
      words,
      playerNames,
    };
  }

  validateAction(
    state: unknown,
    action: unknown,
    playerId: string,
  ): boolean {
    const s = state as WordScrambleState;
    const a = action as WordScrambleAction;

    switch (a.type) {
      case 'guess':
        // Must be playing, not already solved, and have a non-empty guess
        return (
          s.phase === 'playing' &&
          s.players.includes(playerId) &&
          !s.solved[playerId] &&
          typeof a.word === 'string' &&
          a.word.trim().length > 0
        );

      case 'timeout':
        return s.phase === 'playing';

      case 'next_round':
        return s.phase === 'reveal';

      default:
        return false;
    }
  }

  applyAction(
    state: unknown,
    action: unknown,
    playerId: string,
  ): WordScrambleState {
    const s = state as WordScrambleState;
    const a = action as WordScrambleAction;

    switch (a.type) {
      case 'guess':
        return this.applyGuess(s, a, playerId);
      case 'timeout':
        return this.applyTimeout(s);
      case 'next_round':
        return this.applyNextRound(s);
      default:
        return s;
    }
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as WordScrambleState;

    if (s.phase === 'finished') {
      // Already finished — report results
    } else if (s.phase === 'reveal') {
      // Check if this is the final round's reveal — if so, game is over.
      // This lets game_over fire during reveal instead of waiting for next_round.
      const isLastRound = s.gameMode === 'rounds' && s.round >= s.target;
      const targetReached = s.gameMode === 'firstTo' &&
        Math.max(...Object.values(s.scores)) >= s.target;
      if (!isLastRound && !targetReached) {
        return { isOver: false };
      }
    } else {
      return { isOver: false };
    }

    // Find player(s) with the highest score
    const maxScore = Math.max(...Object.values(s.scores));
    const leaders = s.players.filter((pid) => s.scores[pid] === maxScore);

    if (leaders.length === 1) {
      const winnerName = s.playerNames[leaders[0]] ?? 'Unknown';
      return {
        isOver: true,
        winnerId: leaders[0],
        scores: s.scores,
        reason: `${winnerName} wins with ${maxScore} point${maxScore !== 1 ? 's' : ''}!`,
      };
    }

    // Tie — winnerId must be null (not undefined) for GameOver to show "It's a Draw!"
    return {
      isOver: true,
      winnerId: null,
      scores: s.scores,
      reason: `It's a tie at ${maxScore} point${maxScore !== 1 ? 's' : ''} each!`,
    };
  }

  getPlayerView(state: unknown, _playerId: string): unknown {
    const s = state as WordScrambleState;

    // Always hide the answer and the full word list
    const sanitized: Partial<WordScrambleState> & Record<string, unknown> = {
      ...s,
      currentWord: '***',   // hidden
      words: [],             // hidden
    };

    // During playing, hide who has solved (no info leaks)
    if (s.phase === 'playing') {
      const hiddenSolved: Record<string, boolean> = {};
      for (const pid of s.players) {
        hiddenSolved[pid] = pid === _playerId ? s.solved[pid] : false;
      }
      sanitized.solved = hiddenSolved;
    }

    return sanitized;
  }

  // ── Private helpers ─────────────────────────────────────────

  private applyGuess(
    s: WordScrambleState,
    a: GuessAction,
    playerId: string,
  ): WordScrambleState {
    const guess = a.word.trim().toLowerCase();
    const answer = s.currentWord.toLowerCase();

    // Wrong guess — return state unchanged (client handles shake locally)
    if (guess !== answer) {
      return s;
    }

    // Correct guess!
    const newScores = { ...s.scores, [playerId]: (s.scores[playerId] ?? 0) + 1 };
    const newSolved = { ...s.solved, [playerId]: true };

    // Always go to reveal first so players see who got it
    return {
      ...s,
      phase: 'reveal',
      scores: newScores,
      solved: newSolved,
      lastResult: {
        word: s.currentWord,
        solverId: playerId,
      },
    };
  }

  private applyTimeout(s: WordScrambleState): WordScrambleState {
    // Always go to reveal first so players see the answer
    return {
      ...s,
      phase: 'reveal',
      lastResult: {
        word: s.currentWord,
        solverId: null,
      },
    };
  }

  private applyNextRound(s: WordScrambleState): WordScrambleState {
    const nextRound = s.round + 1;

    // Check if game should end
    // Rounds mode: we've played all rounds
    if (s.gameMode === 'rounds' && nextRound > s.target) {
      return { ...s, phase: 'finished' };
    }
    // First-to mode: someone hit the target score
    if (s.gameMode === 'firstTo') {
      const maxScore = Math.max(...Object.values(s.scores));
      if (maxScore >= s.target) {
        return { ...s, phase: 'finished' };
      }
    }

    // Get next word
    const nextWordIdx = nextRound - 1;
    const nextWord =
      nextWordIdx < s.words.length
        ? s.words[nextWordIdx]
        : s.words[Math.floor(Math.random() * s.words.length)]; // fallback

    // Reset solved status for all players
    const resetSolved: Record<string, boolean> = {};
    for (const pid of s.players) {
      resetSolved[pid] = false;
    }

    return {
      ...s,
      phase: 'playing',
      round: nextRound,
      currentWord: nextWord,
      scrambledWord: scrambleWord(nextWord),
      solved: resetSolved,
      roundStartTime: Date.now(),
      lastResult: null,
    };
  }
}
