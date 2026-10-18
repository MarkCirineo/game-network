"use client";

// ============================================================
// ArcadeKit — Daily Rank (client)
// Loads today's puzzle for the player's own date, plays the three
// rounds (each graded by the server), then shows the results.
// Reloading picks up where the player left off.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { DAILY_GAME_NAME, localDateString, MAX_DAY_SCORE, ROUNDS_PER_DAY, THEMES } from "@/lib/daily/config";
import { computeStats, readLocalHistory, saveLocalEntry, type DailyStats } from "@/lib/daily/history";
import type { DailyState, DaySummary, HistoryEntry, RoundReveal } from "@/lib/daily/types";
import { Results } from "./Results";
import { RoundBoard } from "./RoundBoard";
import { RoundRevealView } from "./RoundRevealView";

async function readError(response: Response): Promise<string> {
  try {
    return (await response.json()).error ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

function entryFor(state: DailyState): HistoryEntry {
  return {
    puzzle: state.puzzle,
    token: state.token,
    score: state.summary!.score,
    themes: state.rounds.map((round) => round.theme),
    marks: state.reveals.map((reveal) => reveal.marks),
  };
}

function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DailyGame() {
  const [state, setState] = useState<DailyState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  /** Reveal being shown for the round just played, before moving on */
  const [pendingReveal, setPendingReveal] = useState<RoundReveal | null>(null);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const started = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  /** Streaks and stats: the account's history if signed in, else this browser's */
  const refreshStats = useCallback(async (current: DailyState) => {
    const local = readLocalHistory();
    if (!current.signedIn) {
      setStats(computeStats(local, current.puzzle));
      return;
    }
    try {
      // Also hands any guest plays from this browser over to the account
      const tokens = local.map((entry) => entry.token).filter(Boolean);
      const response = await fetch("/api/daily/me", {
        method: tokens.length ? "POST" : "GET",
        headers: tokens.length ? { "Content-Type": "application/json" } : undefined,
        body: tokens.length ? JSON.stringify({ tokens }) : undefined,
      });
      if (!response.ok) throw new Error(await readError(response));
      const { history } = (await response.json()) as { history: HistoryEntry[] };
      setStats(computeStats(history, current.puzzle));
    } catch {
      setStats(null);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/daily?date=${localDateString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const next = (await response.json()) as DailyState;
      setState(next);
      const round = next.rounds[next.reveals.length];
      if (round) setOrder(round.items.map((item) => item.id));
      if (next.summary && !next.signedIn) saveLocalEntry(entryFor(next));
      if (next.summary) refreshStats(next);
      if (!next.summary && !started.current) {
        started.current = true;
        trackEvent("daily-start", { puzzle: next.puzzle, signed_in: next.signedIn });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load today's puzzle.");
    }
  }, [refreshStats]);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect -- state is only set once the request resolves
  }, [load]);

  const lockIn = async () => {
    if (!state || submitting) return;
    const roundIndex = state.reveals.length;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/daily/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: state.token, round: roundIndex, guess: order }),
      });
      if (response.status === 409) {
        // Already played in another tab: reload to catch up
        await load();
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      const { reveal, summary } = (await response.json()) as { reveal: RoundReveal; summary: DaySummary | null };
      const round = state.rounds[roundIndex];
      trackEvent("daily-round", {
        puzzle: state.puzzle,
        round: roundIndex + 1,
        theme: round.theme,
        category: round.categoryId,
        score: reveal.score,
      });
      setPendingReveal(reveal);
      // The reveal is taller than the board; keep the top of the card in view
      requestAnimationFrame(() => card.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      setState({ ...state, reveals: [...state.reveals, reveal], summary });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't lock that in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!state) return;
    setPendingReveal(null);
    const round = state.rounds[state.reveals.length];
    if (round) {
      setOrder(round.items.map((item) => item.id));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Day finished
    const history = state.signedIn ? null : saveLocalEntry(entryFor(state));
    const streak = history ? computeStats(history, state.puzzle).currentStreak : 0;
    trackEvent("daily-complete", {
      puzzle: state.puzzle,
      score: state.summary!.score,
      streak,
      signed_in: state.signedIn,
    });
    refreshStats(state);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!state) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface p-6 text-center">
        {error ? (
          <>
            <p className="text-sm text-foreground">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                load();
              }}
              className="mt-3 text-sm font-medium text-ember hover:underline">
              Try again
            </button>
          </>
        ) : (
          <p className="text-sm text-text-secondary">Loading today&apos;s puzzle…</p>
        )}
      </div>
    );
  }

  const roundIndex = pendingReveal ? state.reveals.length - 1 : state.reveals.length;
  const finished = !pendingReveal && state.reveals.length === ROUNDS_PER_DAY;
  const round = state.rounds[roundIndex];
  const totalScore = state.reveals.reduce((total, reveal) => total + reveal.score, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="whitespace-nowrap text-sm text-text-secondary">
          <span className="font-semibold text-foreground">
            {DAILY_GAME_NAME} #{state.puzzle}
          </span>{" "}
          · {formatDate(state.date)}
        </p>
        {/* One chip per round: its points once played; then the running total */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden>
            {state.rounds.map((r, index) => {
              const done = state.reveals[index];
              return (
                <span
                  key={index}
                  className={cn(
                    "flex h-6 w-7 items-center justify-center rounded-md text-xs font-semibold",
                    done
                      ? "bg-ember/20 text-ember"
                      : index === roundIndex
                        ? "border border-ember/50 text-text-secondary"
                        : "bg-elevated text-text-muted",
                  )}
                >
                  {done ? done.score : "–"}
                </span>
              );
            })}
          </div>
          <p className="whitespace-nowrap text-sm text-text-secondary" aria-live="polite">
            <span className="hidden sm:inline">Score </span>
            <span className="font-semibold text-foreground">{totalScore}</span>/{MAX_DAY_SCORE}
          </p>
        </div>
      </div>

      {finished ? (
        <>
          <Results state={state} stats={stats} />
          <details className="rounded-2xl border border-white/10 bg-surface p-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground">See today&apos;s answers</summary>
            <div className="mt-4 space-y-6">
              {state.rounds.map((r, index) => (
                <div key={index}>
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    {THEMES[r.theme].emoji} {r.title}
                  </p>
                  <RoundRevealView round={r} reveal={state.reveals[index]} />
                </div>
              ))}
            </div>
          </details>
        </>
      ) : (
        <div ref={card} className="scroll-mt-20 rounded-2xl border border-white/10 bg-surface/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {THEMES[round.theme].emoji} {THEMES[round.theme].name} · Round {roundIndex + 1} of {ROUNDS_PER_DAY}
          </p>
          <h2 className="mt-1 mb-4 font-heading text-xl font-bold text-foreground">{round.title}</h2>

          {pendingReveal ? (
            <>
              <RoundRevealView round={round} reveal={pendingReveal} />
              <button
                type="button"
                onClick={next}
                className="mt-5 h-11 w-full rounded-lg bg-ember text-sm font-medium text-white transition-colors hover:bg-ember/90"
              >
                {state.reveals.length < ROUNDS_PER_DAY ? "Next round" : "See your results"}
              </button>
            </>
          ) : (
            <>
              <RoundBoard key={roundIndex} round={round} order={order} onChange={setOrder} disabled={submitting} />
              <button
                type="button"
                onClick={lockIn}
                disabled={submitting}
                className="mt-5 h-11 w-full rounded-lg bg-ember text-sm font-medium text-white transition-colors hover:bg-ember/90 disabled:opacity-60"
              >
                {submitting ? "Checking…" : "Lock it in"}
              </button>
            </>
          )}
          {error && <p className="mt-3 text-center text-sm text-coral">{error}</p>}
        </div>
      )}
    </div>
  );
}
