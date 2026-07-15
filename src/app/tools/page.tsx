// ============================================================
// ArcadeKit — Tools Hub Page
// Browse all free game utility tools.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Game Tools",
  description:
    "Free online tools for tabletop, board, and party games. Dice roller, coin flip, chess clock, team generator, and more. No downloads or sign-ups required.",
  openGraph: {
    title: "Free Game Tools | ArcadeKit",
    description:
      "Free online tools for tabletop, board, and party games. Dice roller, coin flip, chess clock, team generator, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Game Tools | ArcadeKit",
    description:
      "Free online tools for tabletop, board, and party games. No downloads or sign-ups required.",
  },
};

const tools = [
  {
    slug: "dice-roller",
    emoji: "🎲",
    name: "Dice Roller",
    description: "Roll any combination of dice for tabletop and board games",
    accentColor: "#3B82F6",
  },
  {
    slug: "coin-flip",
    emoji: "🪙",
    name: "Coin Flip",
    description: "Flip a virtual coin with statistics and streak tracking",
    accentColor: "#F59E0B",
  },
  {
    slug: "chess-clock",
    emoji: "♟️",
    name: "Chess Clock",
    description: "Dual timer with presets for chess and other timed games",
    accentColor: "#22C55E",
  },
  {
    slug: "team-generator",
    emoji: "👥",
    name: "Team Generator",
    description: "Randomly split players into balanced teams",
    accentColor: "#8B5CF6",
  },
  {
    slug: "card-shuffler",
    emoji: "🃏",
    name: "Card Shuffler",
    description: "Shuffle and draw from a virtual deck of cards",
    accentColor: "#EF4444",
  },
  {
    slug: "battleship-board",
    emoji: "🚢",
    name: "Battleship Board",
    description: "Generate random Battleship board layouts for paper play",
    accentColor: "#0EA5E9",
  },
  {
    slug: "spin-wheel",
    emoji: "🎡",
    name: "Spin Wheel",
    description: "Customizable random spinner for decisions and games",
    accentColor: "#F97316",
  },
  {
    slug: "score-keeper",
    emoji: "📊",
    name: "Score Keeper",
    description: "Track scores for any game with round history",
    accentColor: "#06D6A0",
  },
];

export default function ToolsPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative px-4 pb-4 pt-10 text-center md:pb-6 md:pt-14">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-ember/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Free Game{" "}
            <span className="gradient-text">Tools</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary md:text-base">
            Free online utilities for tabletop, board, and party games.
            No downloads, no sign-ups — just open and use.
          </p>
        </div>
      </section>

      {/* ── Tools Grid ────────────────────────────────────── */}
      <section className="px-4 pb-8 pt-4 md:pb-12 md:pt-6">
        <div className="mx-auto max-w-4xl">
          {/* Section label */}
          <div className="mb-5 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-ember" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Tools
            </h2>
          </div>

          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all duration-200 hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5"
                style={
                  {
                    "--card-accent": tool.accentColor,
                  } as React.CSSProperties
                }
              >
                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--card-accent)]/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Accent top-border line */}
                <div
                  className="absolute left-0 right-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: tool.accentColor }}
                />

                <div className="relative">
                  <span className="text-4xl">{tool.emoji}</span>

                  <h3 className="mt-4 font-heading text-lg font-bold">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ember transition-colors group-hover:text-ember/80">
                    Open Tool
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
