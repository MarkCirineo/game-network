// ============================================================
// ArcadeKit — Reaction Race Engine
// Fast-paced reaction time game: 2–8 players, client-side timing.
// ============================================================

import { GameEngine } from '../GameEngine.js';
import type { PlayerInfo, GameStatus } from '../../../shared/messages.js';
import type { GameOptionSchema } from '../../../shared/gameOptions.js';

// ── Types ───────────────────────────────────────────────────

interface ReactionRaceState {
  phase: 'countdown' | 'waiting' | 'result' | 'finished';
  round: number;
  gameMode: 'rounds' | 'firstTo';
  target: number;
  scores: Record<string, number>;
  goTime: number;
  delay: number;
  reactions: Record<string, number | 'false_start' | 'no_reaction' | null>;
  lastResult: {
    winnerId: string | null;
    reactions: Record<string, number | 'false_start' | 'no_reaction'>;
  } | null;
  countdownStartTime: number;
  players: string[];
  playerNames: Record<string, string>;
}

interface ReactAction {
  type: 'react';
  reactionTime: number;
}

interface TimeoutAction {
  type: 'timeout';
}

interface NextRoundAction {
  type: 'next_round';
}

type ReactionRaceAction = ReactAction | TimeoutAction | NextRoundAction;

// ── Helpers ─────────────────────────────────────────────────

/** Random delay between 2–5 seconds */
function randomDelay(): number {
  return 2000 + Math.floor(Math.random() * 3001);
}

/** Parse game mode string like 'rounds_5' or 'firstTo_3'. */
function parseGameMode(value: string): { mode: 'rounds' | 'firstTo'; target: number } {
  const parts = value.split('_');
  const mode = parts[0] === 'firstTo' ? 'firstTo' : 'rounds';
  const target = parseInt(parts[1], 10) || 5;
  return { mode, target };
}

// ── Engine ──────────────────────────────────────────────────

export class ReactionRaceEngine extends GameEngine {
  readonly name = 'Reaction Race';
  readonly minPlayers = 2;
  readonly maxPlayers = 8;

  getDefaultOptions(): Record<string, unknown> {
    return { gameMode: 'rounds_5' };
  }

  getOptionsSchema(): GameOptionSchema[] {
    return [
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
  ): ReactionRaceState {
    const gameModeStr = (options?.gameMode as string) ?? 'rounds_5';
    const { mode, target } = parseGameMode(gameModeStr);

    const scores: Record<string, number> = {};
    const reactions: Record<string, null> = {};
    const playerNames: Record<string, string> = {};

    for (const player of players) {
      scores[player.id] = 0;
      reactions[player.id] = null;
      playerNames[player.id] = player.name;
    }

    const delay = randomDelay();

    return {
      phase: 'waiting',
      round: 1,
      gameMode: mode,
      target,
      scores,
      goTime: Date.now() + delay,
      delay,
      reactions,
      lastResult: null,
      countdownStartTime: 0,
      players: players.map((p) => p.id),
      playerNames,
    };
  }

  validateAction(
    state: unknown,
    action: unknown,
    playerId: string,
  ): boolean {
    const s = state as ReactionRaceState;
    const a = action as ReactionRaceAction;

    switch (a.type) {
      case 'react':
        return (
          s.phase === 'waiting' &&
          s.players.includes(playerId) &&
          s.reactions[playerId] === null &&
          typeof a.reactionTime === 'number'
        );

      case 'timeout':
        return s.phase === 'waiting';

      case 'next_round':
        return s.phase === 'result';

      default:
        return false;
    }
  }

  applyAction(
    state: unknown,
    action: unknown,
    playerId: string,
  ): ReactionRaceState {
    const s = state as ReactionRaceState;
    const a = action as ReactionRaceAction;

    switch (a.type) {
      case 'react':
        return this.applyReact(s, a as ReactAction, playerId);
      case 'timeout':
        return this.applyTimeout(s);
      case 'next_round':
        return this.applyNextRound(s);
      default:
        return s;
    }
  }

  getGameStatus(state: unknown): GameStatus {
    const s = state as ReactionRaceState;

    if (s.phase === 'finished') {
      // Already finished — report results
    } else if (s.phase === 'result') {
      // Check if this is the final round's result — game ends here
      const isLastRound = s.gameMode === 'rounds' && s.round >= s.target;
      const targetReached =
        s.gameMode === 'firstTo' &&
        Math.max(...Object.values(s.scores)) >= s.target;
      if (!isLastRound && !targetReached) {
        return { isOver: false };
      }
    } else {
      return { isOver: false };
    }

    // Find winner
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

    return {
      isOver: true,
      winnerId: null,
      scores: s.scores,
      reason: `It's a tie at ${maxScore} point${maxScore !== 1 ? 's' : ''} each!`,
    };
  }

  getPlayerView(state: unknown, _playerId: string): unknown {
    const s = state as ReactionRaceState;

    // During active round, hide other players' reactions (no peeking)
    if (s.phase === 'waiting') {
      const hiddenReactions: Record<string, number | 'false_start' | 'no_reaction' | null> = {};
      for (const pid of s.players) {
        hiddenReactions[pid] = pid === _playerId ? s.reactions[pid] : null;
      }
      return { ...s, reactions: hiddenReactions };
    }

    return s;
  }

  // ── Private helpers ─────────────────────────────────────────

  private applyReact(
    s: ReactionRaceState,
    a: ReactAction,
    playerId: string,
  ): ReactionRaceState {
    const rt = a.reactionTime;

    let reaction: number | 'false_start';
    if (rt < 0) {
      // Client reports false start (clicked before GO)
      reaction = 'false_start';
    } else {
      reaction = rt;
    }

    const newReactions = { ...s.reactions, [playerId]: reaction };

    // Check if all players have reacted
    const allReacted = s.players.every((pid) => newReactions[pid] !== null);

    if (allReacted) {
      return this.resolveRound(s, newReactions as Record<string, number | 'false_start' | 'no_reaction'>);
    }

    return { ...s, reactions: newReactions };
  }

  private applyTimeout(s: ReactionRaceState): ReactionRaceState {
    // Mark unreacted players as 'no_reaction'
    const finalReactions: Record<string, number | 'false_start' | 'no_reaction'> = {};
    for (const pid of s.players) {
      const r = s.reactions[pid];
      if (r === null) {
        finalReactions[pid] = 'no_reaction';
      } else {
        finalReactions[pid] = r as number | 'false_start';
      }
    }
    return this.resolveRound(s, finalReactions);
  }

  private resolveRound(
    s: ReactionRaceState,
    reactions: Record<string, number | 'false_start' | 'no_reaction'>,
  ): ReactionRaceState {
    // Find winner — fastest valid reaction time
    let winnerId: string | null = null;
    let bestTime = Infinity;

    for (const pid of s.players) {
      const r = reactions[pid];
      if (typeof r === 'number' && r < bestTime) {
        bestTime = r;
        winnerId = pid;
      }
    }

    const newScores = { ...s.scores };
    if (winnerId) {
      newScores[winnerId] = (newScores[winnerId] ?? 0) + 1;
    }

    return {
      ...s,
      phase: 'result',
      scores: newScores,
      reactions,
      lastResult: {
        winnerId,
        reactions,
      },
    };
  }

  private applyNextRound(s: ReactionRaceState): ReactionRaceState {
    if (s.phase === 'result') {
      // Go directly to next round's waiting phase (no countdown screen)
      const nextRound = s.round + 1;
      const delay = randomDelay();
      const resetReactions: Record<string, null> = {};
      for (const pid of s.players) {
        resetReactions[pid] = null;
      }

      return {
        ...s,
        phase: 'waiting',
        round: nextRound,
        goTime: Date.now() + delay,
        delay,
        reactions: resetReactions,
        lastResult: null,
      };
    }

    return s;
  }
}
