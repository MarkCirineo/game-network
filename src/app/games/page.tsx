// ============================================================
// ArcadeKit — Games Catalog Page
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Browse all available multiplayer games on ArcadeKit. Pick a game, create a room, and play with friends instantly.",
};

// Game data (will be replaced by registry import once games are built)
const games = [
  {
    id: "tic-tac-toe",
    emoji: "❌",
    name: "Tic Tac Toe",
    shortDescription: "Classic strategy — get three in a row to win",
    category: "strategy",
    players: "2 players",
    duration: "~2 min",
    accentColor: "#3B82F6",
    tags: ["classic", "strategy", "two-player"],
  },
  {
    id: "rock-paper-scissors",
    emoji: "✊",
    name: "Rock Paper Scissors",
    shortDescription: "Best of 3 showdown — outsmart your opponent",
    category: "quick",
    players: "2 players",
    duration: "~2 min",
    accentColor: "#F97316",
    tags: ["classic", "quick", "two-player"],
  },
  {
    id: "connect-four",
    emoji: "🔴",
    name: "Connect Four",
    shortDescription: "Drop discs, connect four to win",
    category: "strategy",
    players: "2 players",
    duration: "2–5 min",
    accentColor: "#EF4444",
    tags: ["classic", "strategy", "two-player", "grid"],
  },
  {
    id: "battleship",
    emoji: "🚢",
    name: "Battleship",
    shortDescription: "Sink the enemy fleet",
    category: "strategy",
    players: "2 players",
    duration: "5–15 min",
    accentColor: "#0EA5E9",
    tags: ["classic", "strategy", "two-player", "hidden-info", "naval"],
  },
];

const partnerGames = [
  {
    name: "Guess Who",
    description:
      "Classic deduction game — figure out your opponent's mystery character!",
    emoji: "🔍",
    url: "https://playguesswho.net",
    accentColor: "#F59E0B",
  },
];

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
          {games.map((game) => (
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

        {/* Partner Games */}
        {partnerGames.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-secondary">
              More Games
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {partnerGames.map((game) => (
                <a
                  key={game.name}
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all hover:border-white/10 hover:shadow-xl"
                  style={
                    {
                      "--card-accent": game.accentColor,
                    } as React.CSSProperties
                  }
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--card-accent)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <span className="text-3xl">{game.emoji}</span>
                    <h3 className="mt-3 font-heading text-xl font-bold">
                      {game.name}
                      <ExternalLink className="ml-2 inline h-4 w-4 text-text-muted" />
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {game.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
