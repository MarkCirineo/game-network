// ============================================================
// Rule Out — Pure Client Helpers
// ============================================================

import type { BoardCard, RuleOutState, SuggestedQuestion } from './types';

export function cardById(state: RuleOutState, cardId: string | undefined): BoardCard | undefined {
  if (!cardId) return undefined;
  return state.board.cards.find((c) => c.id === cardId);
}

/** The other player, from a viewer's point of view (spectators get player 2). */
export function opponentOf(state: RuleOutState, viewerId: string): string {
  return state.players[0] === viewerId ? state.players[1] : state.players[0];
}

/** Can this viewer make a final guess right now? */
export function canGuess(state: RuleOutState, viewerId: string): boolean {
  if (state.phase !== 'playing' || !state.players.includes(viewerId)) return false;
  if (state.mode === 'free') return true;
  return state.currentTurn === viewerId && state.pendingQuestion === null;
}

/**
 * Suggested questions that still split the cards this player hasn't
 * ruled out, closest to an even split first. A question every
 * remaining card shares (or none does) can't narrow anything down.
 */
export function usefulQuestions(
  state: RuleOutState,
  ruledOut: ReadonlySet<string>,
  limit: number,
): SuggestedQuestion[] {
  const standing = state.board.cards.filter((c) => !ruledOut.has(c.id));
  if (standing.length <= 1) return [];

  return state.board.questions
    .map((q) => ({
      q,
      matches: standing.filter((c) => c.tags?.includes(q.tag)).length,
    }))
    .filter(({ matches }) => matches > 0 && matches < standing.length)
    .sort(
      (a, b) =>
        Math.abs(a.matches - standing.length / 2) -
        Math.abs(b.matches - standing.length / 2),
    )
    .slice(0, limit)
    .map(({ q }) => q);
}
