"use client";

// ============================================================
// ArcadeKit — Daily Rank: a round's answer
// The correct order with the real numbers, each item colored by
// how close the player put it.
// ============================================================

import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayEmoji } from "@/lib/daily/emoji";
import { MAX_ROUND_SCORE } from "@/lib/daily/config";
import { marksToGrid, type ItemMark } from "@/lib/daily/scoring";
import type { PublicRound, RoundReveal } from "@/lib/daily/types";

const MARK_STYLE: Record<ItemMark, { row: string; label: string }> = {
  2: { row: "border-cyan/40 bg-cyan/10", label: "Right spot" },
  1: { row: "border-amber/40 bg-amber/10", label: "One off" },
  0: { row: "border-white/10 bg-surface", label: "" },
};

export function RoundRevealView({ round, reveal }: { round: PublicRound; reveal: RoundReveal }) {
  // Marks come in the player's order; look them up by item
  const markFor = new Map(reveal.guess.map((id, index) => [id, reveal.marks[index]]));
  const guessedAt = new Map(reveal.guess.map((id, index) => [id, index + 1]));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-xl bg-elevated px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">This round</p>
          <p className="font-heading text-3xl font-bold text-foreground">
            {reveal.score}
            <span className="text-lg text-text-secondary">/{MAX_ROUND_SCORE}</span>
          </p>
        </div>
        <p className="font-mono text-xl" aria-label={`${reveal.score} points`}>
          {marksToGrid(reveal.marks)}
        </p>
      </div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-cyan">
        <ArrowUp className="h-4 w-4" /> {round.top}
      </p>
      <ol className="space-y-2">
        {reveal.answer.map((item, index) => {
          const mark = markFor.get(item.id) ?? 0;
          const style = MARK_STYLE[mark];
          return (
            <li key={item.id} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2", style.row)}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-text-secondary">
                {index + 1}
              </span>
              {displayEmoji(item.emoji) && <span className="text-xl leading-none">{item.emoji}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{item.name}</span>
                <span className="block truncate text-xs text-text-secondary">
                  {mark === 2 ? style.label : `You put it #${guessedAt.get(item.id)}`}
                  {item.detail ? ` · ${item.detail}` : ""}
                </span>
              </span>
              <a
                href={item.source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 text-right text-sm font-semibold text-foreground hover:text-ember"
                title="Where this number comes from"
              >
                {item.value}
                <ExternalLink className="h-3 w-3 text-text-muted" />
              </a>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 flex items-center justify-between text-sm text-text-secondary">
        <span className="flex items-center gap-1.5">
          <ArrowDown className="h-4 w-4" /> {round.bottom}
        </span>
        <span className="text-xs text-text-muted">Source: {reveal.credit}</span>
      </p>
    </div>
  );
}
