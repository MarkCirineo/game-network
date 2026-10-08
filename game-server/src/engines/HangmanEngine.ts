// ============================================================
// ArcadeKit — Hangman Engine
// Turn-based letter guessing on a shared gallows. 2–8 players,
// themed word lists, configurable rounds and strike limits.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';
import type { GameOptionSchema } from '../../../shared/gameOptions.js';
import { WORD_LISTS } from './wordLists.js';

// ── Types ───────────────────────────────────────────────────

interface HangmanState {
  phase: 'playing' | 'reveal' | 'finished';
  round: number;
  totalRounds: number;
  theme: string;
  maxStrikes: number;
  strikes: number;
  /** The answer — masked via getPlayerView while playing */
  word: string;
  /** Every letter guessed this round, in order (lowercase) */
  guessedLetters: string[];
  /** Player ID whose turn it is (drives isMyTurn in the client store) */
  currentTurn: string;
  scores: Record<string, number>;
  lastResult: {
    word: string;
    outcome: 'solved' | 'hanged';
    solverId: string | null;
  } | null;
  players: string[];
  playerNames: Record<string, string>;
  /** Pre-selected words for all rounds (hidden from clients) */
  words: string[];
}

interface GuessLetterAction {
  type: 'guess_letter';
  letter: string;
}

interface GuessWordAction {
  type: 'guess_word';
  word: string;
}

interface NextRoundAction {
  type: 'next_round';
}

type HangmanAction = GuessLetterAction | GuessWordAction | NextRoundAction;

// ── Scoring ─────────────────────────────────────────────────

/** Points per occurrence for a correct letter guess */
const LETTER_POINTS = 10;
/** Bonus for revealing the final letter of the word */
const COMPLETION_BONUS = 20;
/** Points per still-hidden letter for a correct full-word solve */
const SOLVE_POINTS_PER_LETTER = 20;

// ── Helpers ─────────────────────────────────────────────────

/** Pick N random unique items from an array. */
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/** Words suitable for hangman: single lowercase words, 4–12 letters. */
function playableWords(theme: string): string[] {
  const list = WORD_LISTS[theme] ?? WORD_LISTS['random'] ?? [];
  return list.filter((w) => /^[a-z]{4,12}$/.test(w));
}

/** True once every letter of the word has been guessed. */
function isFullyRevealed(word: string, guessedLetters: string[]): boolean {
  return word.split('').every((ch) => guessedLetters.includes(ch));
}

/** Count positions of `word` whose letter has not been guessed yet. */
function countHiddenLetters(word: string, guessedLetters: string[]): number {
  return word.split('').filter((ch) => !guessedLetters.includes(ch)).length;
}

// ── Engine ──────────────────────────────────────────────────

export class HangmanEngine extends GameEngine {
  readonly name = 'Hangman';
  readonly minPlayers = 2;
  readonly maxPlayers = 8;

  getDefaultOptions(): Record<string, unknown> {
    return { theme: 'random', rounds: 5, maxStrikes: 6 };
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
    ];
  }

  createInitialState(
    players: PlayerInfo[],
    options?: Record<string, unknown>,
  ): HangmanState {
    const theme = (options?.theme as string) ?? 'random';
    const totalRounds = Number(options?.rounds) || 5;
    const maxStrikes = Number(options?.maxStrikes) || 6;

    const pool = playableWords(theme);
    const words = pickRandom(pool, Math.min(totalRounds, pool.length));

    const scores: Record<string, number> = {};
    const playerNames: Record<string, string> = {};
    for (const player of players) {
      scores[player.id] = 0;
      playerNames[player.id] = player.name;
    }

    const playerIds = players.map((p) => p.id);

    return {
      phase: 'playing',
      round: 1,
      totalRounds,
      theme,
      maxStrikes,
      strikes: 0,
      word: words[0] ?? 'hangman',
      guessedLetters: [],
      currentTurn: playerIds[0],
      scores,
      lastResult: null,
      players: playerIds,
      playerNames,
      words,
    };
  }

  validateAction(
    state: unknown,
    action: unknown,
    playerId: string,
  ): boolean {
    const s = state as HangmanState;
    const a = action as HangmanAction;

    switch (a.type) {
      case 'guess_letter':
        return (
          s.phase === 'playing' &&
          s.currentTurn === playerId &&
          typeof a.letter === 'string' &&
          /^[a-zA-Z]$/.test(a.letter) &&
          !s.guessedLetters.includes(a.letter.toLowerCase())
        );

      case 'guess_word':
        return (
          s.phase === 'playing' &&
          s.currentTurn === playerId &&
          typeof a.word === 'string' &&
          /^[a-zA-Z]+$/.test(a.word.trim())
        );

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
  ): HangmanState {
    const s = state as HangmanState;
    const a = action as HangmanAction;

    switch (a.type) {
      case 'guess_letter':
        return this.applyGuessLetter(s, a, playerId);
      case 'guess_word':
        return this.applyGuessWord(s, a, playerId);
      case 'next_round':
        return this.applyNextRound(s);
      default:
        return s;
    }
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as HangmanState;

    if (s.phase === 'finished') {
      // Already finished — report results
    } else if (s.phase === 'reveal') {
      // Final round's reveal ends the game without waiting for next_round
      if (s.round < s.totalRounds) {
        return { isOver: false };
      }
    } else {
      return { isOver: false };
    }

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

  /**
   * Drop a permanently-removed player from the turn rotation so a
   * 3+ player game can't stall waiting on a ghost turn. Their score
   * entry is removed so they can't be crowned winner in absentia;
   * playerNames is kept for lastResult name lookups.
   */
  handlePlayerRemoved(state: unknown, playerId: string): unknown {
    const s = state as HangmanState;
    if (!s.players.includes(playerId) || s.players.length <= 1) return s;

    const players = s.players.filter((pid) => pid !== playerId);

    // If it was their turn, advance to the next seat in the old order
    // (players.length >= 2 guarantees this is a different player)
    let currentTurn = s.currentTurn;
    if (currentTurn === playerId) {
      const idx = s.players.indexOf(playerId);
      currentTurn = s.players[(idx + 1) % s.players.length];
    }

    const scores = { ...s.scores };
    delete scores[playerId];

    return { ...s, players, currentTurn, scores };
  }

  getPlayerView(state: unknown, _playerId: string): unknown {
    const s = state as HangmanState;

    // Mask unguessed letters while the round is live; hide the word list always
    const word =
      s.phase === 'playing'
        ? s.word
            .split('')
            .map((ch) => (s.guessedLetters.includes(ch) ? ch : '_'))
            .join('')
        : s.word;

    return { ...s, word, words: [] };
  }

  // ── Private helpers ─────────────────────────────────────────

  private nextPlayer(s: HangmanState): string {
    const idx = s.players.indexOf(s.currentTurn);
    return s.players[(idx + 1) % s.players.length];
  }

  private endRound(
    s: HangmanState,
    outcome: 'solved' | 'hanged',
    solverId: string | null,
  ): HangmanState {
    return {
      ...s,
      phase: 'reveal',
      lastResult: { word: s.word, outcome, solverId },
    };
  }

  private applyGuessLetter(
    s: HangmanState,
    a: GuessLetterAction,
    playerId: string,
  ): HangmanState {
    const letter = a.letter.toLowerCase();
    const guessedLetters = [...s.guessedLetters, letter];

    if (s.word.includes(letter)) {
      const occurrences = s.word.split('').filter((ch) => ch === letter).length;
      let points = occurrences * LETTER_POINTS;

      const revealed = isFullyRevealed(s.word, guessedLetters);
      if (revealed) points += COMPLETION_BONUS;

      const next: HangmanState = {
        ...s,
        guessedLetters,
        scores: { ...s.scores, [playerId]: (s.scores[playerId] ?? 0) + points },
        // Correct guess — the same player keeps the turn
      };

      return revealed ? this.endRound(next, 'solved', playerId) : next;
    }

    // Wrong letter — strike the gallows, pass the turn
    const strikes = s.strikes + 1;
    const next: HangmanState = {
      ...s,
      guessedLetters,
      strikes,
      currentTurn: this.nextPlayer(s),
    };

    return strikes >= s.maxStrikes ? this.endRound(next, 'hanged', null) : next;
  }

  private applyGuessWord(
    s: HangmanState,
    a: GuessWordAction,
    playerId: string,
  ): HangmanState {
    const guess = a.word.trim().toLowerCase();

    if (guess === s.word) {
      const hidden = countHiddenLetters(s.word, s.guessedLetters);
      const points = hidden * SOLVE_POINTS_PER_LETTER;
      const next: HangmanState = {
        ...s,
        scores: { ...s.scores, [playerId]: (s.scores[playerId] ?? 0) + points },
      };
      return this.endRound(next, 'solved', playerId);
    }

    // Wrong solve attempt — strike the gallows, pass the turn
    const strikes = s.strikes + 1;
    const next: HangmanState = {
      ...s,
      strikes,
      currentTurn: this.nextPlayer(s),
    };

    return strikes >= s.maxStrikes ? this.endRound(next, 'hanged', null) : next;
  }

  private applyNextRound(s: HangmanState): HangmanState {
    const nextRound = s.round + 1;

    if (nextRound > s.totalRounds) {
      return { ...s, phase: 'finished' };
    }

    const nextWordIdx = nextRound - 1;
    const word =
      nextWordIdx < s.words.length
        ? s.words[nextWordIdx]
        : s.words[Math.floor(Math.random() * s.words.length)]; // fallback

    return {
      ...s,
      phase: 'playing',
      round: nextRound,
      strikes: 0,
      word,
      guessedLetters: [],
      // Starting player rotates each round
      currentTurn: s.players[(nextRound - 1) % s.players.length],
      lastResult: null,
    };
  }
}
