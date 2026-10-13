'use client';

// ============================================================
// Rule Out — Game UI Component
// Phone-first: a sticky status bar (your card, turn, question
// controls) above a grid of faces. Tap a face to rule it out;
// make a final guess when you think you know their card.
// ============================================================

import { useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Check, HelpCircle, Send, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '@/games/types';
import { RULE_OUT_MAX_QUESTION_LENGTH } from '../../../shared/ruleOut';
import type { BoardCard, RuleOutAction, RuleOutState } from './types';
import { canGuess, cardById, opponentOf, usefulQuestions } from './logic';

// ── Face card ───────────────────────────────────────────────

function FaceCard({
  card,
  ruledOut,
  selected,
  highlight,
  disabled,
  onClick,
}: {
  card: BoardCard;
  ruledOut: boolean;
  selected: boolean;
  highlight: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ruledOut}
      aria-label={ruledOut ? `${card.name} (ruled out)` : card.name}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-elevated text-left transition-all',
        disabled ? 'cursor-default' : 'cursor-pointer active:scale-95',
        selected
          ? 'border-teal-400 ring-2 ring-teal-400'
          : highlight
            ? 'border-amber ring-2 ring-amber'
            : 'border-white/10 hover:border-white/25',
      )}
    >
      <div className="relative aspect-square w-full">
        <Image
          src={card.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 100px, (min-width: 640px) 16vw, 25vw"
          className={cn(
            'object-cover transition-all duration-200',
            ruledOut && 'opacity-25 grayscale',
          )}
        />
        {ruledOut && (
          <X
            className="absolute inset-0 m-auto h-3/5 w-3/5 text-white/70"
            strokeWidth={2.5}
            aria-hidden
          />
        )}
      </div>
      <span
        className={cn(
          'truncate px-1.5 py-1 text-center text-[11px] font-medium sm:text-xs',
          ruledOut ? 'text-text-muted line-through' : 'text-text-primary',
        )}
      >
        {card.name}
      </span>
    </button>
  );
}

// ── Main component ──────────────────────────────────────────

export default function RuleOutGame({
  gameState,
  myPlayerId,
  isSpectator,
  sendAction,
}: GameComponentProps<RuleOutState, RuleOutAction>) {
  const s = gameState;
  const [guessing, setGuessing] = useState(false);
  const [guessCardId, setGuessCardId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  const isPlayer = !isSpectator && s.players.includes(myPlayerId);
  const finished = s.phase === 'finished';
  const viewerId = isPlayer ? myPlayerId : s.players[0];
  const opponentId = opponentOf(s, viewerId);
  const opponentName = s.playerNames[opponentId] ?? 'Opponent';
  const nameOf = (id: string) => (id === myPlayerId ? 'You' : (s.playerNames[id] ?? 'Someone'));

  const myCard = cardById(s, s.secrets[myPlayerId]);
  const ruledOut = useMemo(
    () => new Set(isPlayer ? (s.ruledOut[myPlayerId] ?? []) : []),
    [isPlayer, s.ruledOut, myPlayerId],
  );
  const suggestions = useMemo(() => usefulQuestions(s, ruledOut, 4), [s, ruledOut]);

  const pending = s.pendingQuestion;
  const iMustAnswer = isPlayer && pending !== null && pending.askerId !== myPlayerId;
  const myTurnToAsk =
    isPlayer && s.mode === 'questions' && s.currentTurn === myPlayerId && pending === null;
  const guessAllowed = isPlayer && canGuess(s, myPlayerId);
  const lastAnswered = s.history[s.history.length - 1];

  // Guess mode closes itself if the turn moves on (e.g. a question arrives)
  const inGuessMode = guessing && guessAllowed;
  const guessCard = inGuessMode ? cardById(s, guessCardId ?? undefined) : undefined;
  // At the end, point at the card the viewer was trying to find
  const revealedId = finished ? s.secrets[opponentId] : undefined;

  function cancelGuess() {
    setGuessing(false);
    setGuessCardId(null);
  }

  function handleCardClick(cardId: string) {
    if (!isPlayer || finished) return;
    if (inGuessMode) {
      setGuessCardId(cardId);
      return;
    }
    sendAction({ type: 'toggle', cardId });
  }

  function ask(text: string) {
    if (!myTurnToAsk || text.trim().length === 0) return;
    sendAction({ type: 'ask', text });
    setQuestion('');
  }

  function confirmGuess() {
    if (!guessCardId || !guessAllowed) return;
    sendAction({ type: 'guess', cardId: guessCardId });
    cancelGuess();
  }

  // ── Status line ──
  let status: ReactNode;
  if (finished && s.result) {
    const { guesserId, guessedCardId, correct } = s.result;
    const guessed = cardById(s, guessedCardId)?.name;
    status = correct
      ? `${nameOf(guesserId)} guessed ${guessed}. Correct!`
      : `${nameOf(guesserId)} guessed ${guessed}. Wrong!`;
  } else if (!isPlayer) {
    status = 'Watching the game';
  } else if (inGuessMode) {
    status = 'Tap the face you think is their card';
  } else if (s.mode === 'free') {
    status = 'Ask yes-or-no questions out loud, then tap faces to rule them out';
  } else if (iMustAnswer) {
    status = `${opponentName} asks:`;
  } else if (pending) {
    status = `Waiting for ${opponentName} to answer…`;
  } else if (myTurnToAsk) {
    status = 'Your turn: ask a question or make your final guess';
  } else {
    status = `${opponentName}'s turn`;
  }

  return (
    <div className="flex w-full flex-col gap-3 pb-4">
      {/* ── Sticky status bar ── */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-white/5 bg-midnight/90 px-4 py-3 backdrop-blur-lg sm:mx-0 sm:rounded-2xl sm:border sm:border-white/10">
        <div className="flex items-center gap-3">
          {/* Your card */}
          {myCard ? (
            <div className="flex items-center gap-2">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-teal-400/40">
                <Image src={myCard.image} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Your card
                </p>
                <p className="text-sm font-bold">{myCard.name}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold">
              {s.playerNames[s.players[0]]} vs {s.playerNames[s.players[1]]}
            </p>
          )}

          {/* Cards left */}
          <div className="ml-auto text-right text-xs leading-snug text-text-secondary">
            {s.players.map((pid) => (
              <p key={pid}>
                {pid === myPlayerId ? 'You' : (s.playerNames[pid] ?? 'Player')}:{' '}
                <span className="font-semibold tabular-nums text-text-primary">
                  {s.remaining[pid]}
                </span>{' '}
                left
              </p>
            ))}
          </div>
        </div>

        <p className="mt-2 text-sm font-medium" aria-live="polite">
          {status}
        </p>

        {/* Answer a question */}
        {iMustAnswer && pending && !finished && (
          <div className="mt-2">
            <p className="rounded-lg bg-white/5 px-3 py-2 text-base font-semibold">
              &ldquo;{pending.text}&rdquo;
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => sendAction({ type: 'answer', answer: 'yes' })}
                className="h-11 cursor-pointer rounded-lg bg-cyan/15 font-semibold text-cyan transition-colors hover:bg-cyan/25"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => sendAction({ type: 'answer', answer: 'no' })}
                className="h-11 cursor-pointer rounded-lg bg-pink/15 font-semibold text-pink transition-colors hover:bg-pink/25"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Ask a question */}
        {myTurnToAsk && !inGuessMode && !finished && (
          <div className="mt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(question);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={RULE_OUT_MAX_QUESTION_LENGTH}
                placeholder="Do they wear glasses?"
                enterKeyHint="send"
                aria-label="Your question"
                className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground placeholder:text-text-muted focus:border-teal-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={question.trim().length === 0}
                aria-label="Ask"
                className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-teal-500 text-white transition-colors hover:bg-teal-400 disabled:cursor-default disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.map((q) => (
                  <button
                    key={q.tag}
                    type="button"
                    onClick={() => ask(q.text)}
                    className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-primary transition-colors hover:border-teal-400/50"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Last answer */}
        {s.mode === 'questions' && lastAnswered && !iMustAnswer && !finished && (
          <p className="mt-2 text-xs text-text-secondary">
            Last: {nameOf(lastAnswered.askerId)} asked &ldquo;{lastAnswered.text}&rdquo;{' '}
            <span
              className={cn(
                'font-semibold',
                lastAnswered.answer === 'yes' ? 'text-cyan' : 'text-pink',
              )}
            >
              {lastAnswered.answer === 'yes' ? 'Yes' : 'No'}
            </span>
          </p>
        )}

        {/* Final guess */}
        {guessAllowed && !finished && (
          <div className="mt-3">
            {!inGuessMode ? (
              <button
                type="button"
                onClick={() => setGuessing(true)}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber/40 text-sm font-semibold text-amber transition-colors hover:bg-amber/10 sm:w-auto sm:px-4"
              >
                <Target className="h-4 w-4" />
                Make final guess
              </button>
            ) : (
              <div className="rounded-lg bg-amber/10 p-3">
                {guessCard ? (
                  <>
                    <p className="text-sm">
                      Guess <strong>{guessCard.name}</strong>? If you&apos;re wrong, you lose.
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={confirmGuess}
                        className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber text-sm font-semibold text-midnight hover:bg-amber/90"
                      >
                        <Check className="h-4 w-4" />
                        Guess {guessCard.name}
                      </button>
                      <button
                        type="button"
                        onClick={cancelGuess}
                        className="h-10 cursor-pointer rounded-lg bg-white/5 text-sm font-medium text-text-secondary hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-amber">Pick a face below.</p>
                    <button
                      type="button"
                      onClick={cancelGuess}
                      className="h-9 cursor-pointer rounded-lg bg-white/5 px-3 text-sm font-medium text-text-secondary hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Board ── */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {s.board.cards.map((card) => (
          <FaceCard
            key={card.id}
            card={card}
            ruledOut={ruledOut.has(card.id)}
            selected={inGuessMode && guessCardId === card.id}
            highlight={card.id === revealedId}
            disabled={!isPlayer || finished}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>

      {isPlayer && !finished && (
        <p className="text-center text-xs text-text-secondary">
          {inGuessMode
            ? 'Tapping a face now picks your guess.'
            : 'Tap a face to rule it out. Tap again to bring it back.'}
        </p>
      )}

      {/* ── Question history ── */}
      {s.history.length > 0 && (
        <details className="rounded-xl border border-white/5 bg-surface px-4 py-3">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-secondary">
            <HelpCircle className="h-4 w-4" />
            Questions asked ({s.history.length})
          </summary>
          <ol className="mt-3 space-y-2">
            {[...s.history].reverse().map((q, i) => (
              <li key={s.history.length - i} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  <span className="text-text-secondary">{nameOf(q.askerId)}:</span> {q.text}
                </span>
                <span
                  className={cn(
                    'shrink-0 font-semibold',
                    q.answer === 'yes' ? 'text-cyan' : 'text-pink',
                  )}
                >
                  {q.answer === 'yes' ? 'Yes' : 'No'}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
