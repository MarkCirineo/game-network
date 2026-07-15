// ============================================================
// ArcadeKit — Guides Hub Page
// Browse all long-form "How to Play" game guides.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { allGuides } from "@/lib/content/game-guides";

export const metadata: Metadata = {
  title: "Game Guides — Rules, Strategy & How to Play",
  description:
    "Complete how-to-play guides for classic games: rules explained step by step, winning strategy, history, variations, and FAQs. Battleship, Connect Four, Tic Tac Toe, and more.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "Game Guides — Rules, Strategy & How to Play | ArcadeKit",
    description:
      "Complete how-to-play guides for classic games: rules, winning strategy, history, variations, and FAQs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Guides — Rules, Strategy & How to Play | ArcadeKit",
    description:
      "Complete how-to-play guides for classic games: rules, winning strategy, history, variations, and FAQs.",
  },
};

export default function GuidesPage() {
  const guides = allGuides();

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
            Game <span className="gradient-text">Guides</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary md:text-base">
            Rules explained step by step, winning strategy, history, and
            answers to the questions everyone asks — for every game on
            ArcadeKit.
          </p>
        </div>
      </section>

      {/* ── Guides Grid ───────────────────────────────────── */}
      <section className="px-4 pb-8 pt-4 md:pb-12 md:pt-6">
        <div className="mx-auto max-w-4xl">
          {/* Section label */}
          <div className="mb-5 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-ember" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              How to Play
            </h2>
          </div>

          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.gameId}
                href={`/games/${guide.gameId}/how-to-play`}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all duration-200 hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5"
                style={
                  {
                    "--card-accent": guide.accentColor,
                  } as React.CSSProperties
                }
              >
                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--card-accent)]/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Accent top-border line */}
                <div
                  className="absolute left-0 right-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: guide.accentColor }}
                />

                <div className="relative">
                  <span className="text-4xl">{guide.emoji}</span>

                  <h3 className="mt-4 font-heading text-lg font-bold">
                    How to Play {guide.gameName}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {guide.heroTagline}
                  </p>

                  {/* CTA */}
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ember transition-colors group-hover:text-ember/80">
                    Read Guide
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
