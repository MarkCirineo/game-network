// ============================================================
// ArcadeKit — Games Catalog Page
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gameCatalog } from "@/lib/gameCatalog";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Browse all available multiplayer games on ArcadeKit. Pick a game, create a room, and play with friends instantly.",
};


export default function GamesPage() {
  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            All Games
          </h1>
          <p className="mt-2 text-text-secondary">
            Pick a game and start playing with friends instantly.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {gameCatalog.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all hover:border-white/10 hover:shadow-xl"
              style={
                { "--card-accent": game.accentColor } as React.CSSProperties
              }
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--card-accent)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative">
                <span className="text-3xl">{game.emoji}</span>
                <h2 className="mt-3 font-heading text-xl font-bold">
                  {game.name}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {game.shortDescription}
                </p>

                <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
                  <span className="rounded-full bg-white/5 px-2.5 py-1">
                    {game.players}
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-1">
                    {game.duration}
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 capitalize">
                    {game.category}
                  </span>
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ember transition-colors group-hover:text-ember/80">
                  Play Now
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
