"use client";

// ============================================================
// ArcadeKit — Daily Rank: end-of-day results
// Score and grid, how it compares to everyone else today, the
// player's streak, sharing, and (for guests) the offer to save
// their streak with an account.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Flame, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { DAILY_PATH, MAX_DAY_SCORE, THEMES } from "@/lib/daily/config";
import { signInPromptSnoozed, snoozeSignInPrompt, type DailyStats } from "@/lib/daily/history";
import { marksToGrid, shareText } from "@/lib/daily/scoring";
import type { DailyState, DaySummary } from "@/lib/daily/types";

function useCountdown(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const minutes = Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / 60_000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function Distribution({ summary }: { summary: DaySummary }) {
  const max = Math.max(1, ...summary.distribution);
  return (
    <div>
      <div className="flex h-20 items-end gap-px" aria-hidden>
        {summary.distribution.map((count, score) => (
          <div
            key={score}
            className={cn(
              "flex-1 rounded-t-sm",
              score === summary.score ? "bg-ember" : count > 0 ? "bg-white/30" : "bg-white/5",
            )}
            style={{ height: `${Math.max(count > 0 ? 6 : 2, (count / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-text-muted">
        <span>0</span>
        <span>Today&apos;s scores</span>
        <span>{MAX_DAY_SCORE}</span>
      </div>
    </div>
  );
}

function summaryLine(summary: DaySummary): string {
  const { beatPercent } = summary;
  if (beatPercent === null) return "You're one of the first to finish today.";
  if (beatPercent === 0) return "A tough one today. Tomorrow's a new puzzle!";
  if (beatPercent === 100) return "Top score so far today!";
  return `You did better than ${beatPercent}% of players today.`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="font-heading text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-text-secondary">{label}</p>
    </div>
  );
}

function SignInPrompt({ streak, onDone }: { streak: number; onDone: () => void }) {
  useEffect(() => {
    trackEvent("daily-signin-prompt", { action: "shown", streak });
  }, [streak]);

  const title = streak > 1 ? `Keep your ${streak}-day streak` : "Start a streak";
  const body =
    streak > 1
      ? "Your streak only lives in this browser. Sign in to save it and your stats on any device."
      : "Sign in to save your streak and stats on any device. It's free and optional.";

  return (
    <div className="rounded-2xl border border-ember/30 bg-ember/5 p-4">
      <p className="flex items-center gap-2 font-heading font-semibold text-foreground">
        <Flame className="h-4 w-4 text-ember" /> {title}
      </p>
      <p className="mt-1 text-sm text-text-secondary">{body}</p>
      <div className="mt-3 flex items-center gap-3">
        <Link
          href={`/sign-in?next=${encodeURIComponent(DAILY_PATH)}`}
          onClick={() => trackEvent("daily-signin-prompt", { action: "sign-in", streak })}
          className="inline-flex h-9 items-center rounded-lg bg-ember px-4 text-sm font-medium text-white hover:bg-ember/90"
        >
          Sign in or create an account
        </Link>
        <button
          type="button"
          onClick={() => {
            snoozeSignInPrompt();
            trackEvent("daily-signin-prompt", { action: "not-now", streak });
            onDone();
          }}
          className="text-sm text-text-secondary hover:text-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

export function Results({ state, stats }: { state: DailyState; stats: DailyStats | null }) {
  const summary = state.summary!;
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);
  // Results only ever render in the browser (after the puzzle loads),
  // so reading localStorage here is safe
  const [showPrompt, setShowPrompt] = useState(() => !state.signedIn && !signInPromptSnoozed());

  const topPercent = summary.beatPercent !== null ? Math.max(1, 100 - summary.beatPercent) : null;
  const rounds = state.rounds.map((round, index) => ({ theme: round.theme, marks: state.reveals[index].marks }));

  const share = async () => {
    const text = shareText({
      puzzle: state.puzzle,
      score: summary.score,
      topPercent,
      rounds,
      url: `${window.location.origin}${DAILY_PATH}`,
    });
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ text });
        trackEvent("daily-share", { puzzle: state.puzzle, method: "share-sheet" });
        return;
      } catch {
        // Cancelled or not allowed: fall back to copying
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent("daily-share", { puzzle: state.puzzle, method: "copy" });
    } catch {
      // Clipboard blocked; nothing else to try
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-surface p-5 text-center">
        <p className="text-sm text-text-secondary">Today&apos;s score</p>
        <p className="font-heading text-5xl font-bold text-foreground">
          {summary.score}
          <span className="text-2xl text-text-secondary">/{MAX_DAY_SCORE}</span>
        </p>
        <div className="mt-3 space-y-1 font-mono text-lg leading-tight">
          {rounds.map((round, index) => (
            <p key={index}>
              <span className="mr-2">{THEMES[round.theme].emoji}</span>
              {marksToGrid(round.marks)}
            </p>
          ))}
        </div>
        <p className="mt-3 text-sm text-foreground">
          {summaryLine(summary)}
        </p>
        <button
          type="button"
          onClick={share}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-ember px-5 text-sm font-medium text-white transition-colors hover:bg-ember/90"
        >
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied ? "Copied" : "Share your result"}
        </button>
      </div>

      {summary.players > 1 && (
        <div className="rounded-2xl border border-white/10 bg-surface p-4">
          <Distribution summary={summary} />
          <p className="mt-2 text-center text-xs text-text-muted">
            {summary.players.toLocaleString()} players so far today
          </p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-surface p-4">
          <Stat label="Played" value={stats.played} />
          <Stat label="Streak" value={stats.currentStreak} />
          <Stat label="Best streak" value={stats.bestStreak} />
          <Stat label="Average" value={stats.average ?? "–"} />
        </div>
      )}

      {showPrompt && <SignInPrompt streak={stats?.currentStreak ?? 1} onDone={() => setShowPrompt(false)} />}

      <p className="text-center text-sm text-text-secondary">
        Next puzzle in <span className="font-semibold text-foreground">{countdown}</span>
      </p>
    </div>
  );
}
