// ============================================================
// ArcadeKit — Landing Page (Hybrid: compact hero + games grid)
// ============================================================

import Link from "next/link";
import {
  ArrowRight,
  Users,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";

// Game data — mirrors registry.ts (server component can't import
// the registry directly because it contains React component refs).
const games = [
  {
    id: "tic-tac-toe",
    emoji: "❌",
    name: "Tic-Tac-Toe",
    shortDescription: "Classic 3-in-a-row strategy",
    players: "2 players",
    duration: "1–2 min",
    accentColor: "#3B82F6",
    category: "Strategy",
  },
  {
    id: "rock-paper-scissors",
    emoji: "✊",
    name: "Rock Paper Scissors",
    shortDescription: "Best of 3 — outsmart your opponent",
    players: "2 players",
    duration: "~2 min",
    accentColor: "#F97316",
    category: "Quick",
  },
  {
    id: "connect-four",
    emoji: "🔴",
    name: "Connect Four",
    shortDescription: "Drop discs, connect four to win",
    players: "2 players",
    duration: "2–5 min",
    accentColor: "#EF4444",
    category: "Strategy",
  },
];

const partnerGames = [
  {
    name: "Guess Who",
    description: "Classic deduction — find the mystery character",
    emoji: "🔍",
    url: "https://playguesswho.net",
    accentColor: "#8B5CF6",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Compact Hero ─────────────────────────────────── */}
      <section className="relative px-4 pb-4 pt-10 text-center md:pb-6 md:pt-14">
        {/* Subtle ambient glow — much smaller than the old SaaS hero */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-ember/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Play Games With{" "}
            <span className="gradient-text">Friends</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary md:text-base">
            No downloads, no sign-ups. Pick a game, share the link, play
            instantly.
          </p>
        </div>
      </section>

      {/* ── Games Grid ───────────────────────────────────── */}
      <section className="px-4 pb-8 pt-4 md:pb-12 md:pt-6">
        <div className="mx-auto max-w-4xl">
          {/* Section label */}
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ember" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Games
            </h2>
          </div>

          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all duration-200 hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5"
                style={
                  {
                    "--card-accent": game.accentColor,
                  } as React.CSSProperties
                }
              >
                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--card-accent)]/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Accent top-border line */}
                <div
                  className="absolute left-0 right-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: game.accentColor }}
                />

                <div className="relative">
                  <span className="text-4xl">{game.emoji}</span>

                  <h3 className="mt-4 font-heading text-lg font-bold">
                    {game.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {game.shortDescription}
                  </p>

                  {/* Meta pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
                      <Users className="h-3 w-3" />
                      {game.players}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
                      <Clock className="h-3 w-3" />
                      {game.duration}
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 capitalize">
                      {game.category}
                    </span>
                  </div>

                  {/* Play CTA */}
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ember transition-colors group-hover:text-ember/80">
                    Play Now
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner / External Games ─────────────────────── */}
      {partnerGames.length > 0 && (
        <section className="border-t border-white/5 px-4 py-8 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                More Games
              </h2>
            </div>

            <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partnerGames.map((game) => (
                <a
                  key={game.name}
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all duration-200 hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5"
                  style={
                    {
                      "--card-accent": game.accentColor,
                    } as React.CSSProperties
                  }
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--card-accent)]/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div
                    className="absolute left-0 right-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: game.accentColor }}
                  />

                  <div className="relative">
                    <span className="text-4xl">{game.emoji}</span>
                    <h3 className="mt-4 font-heading text-lg font-bold">
                      {game.name}
                      <ExternalLink className="ml-2 inline h-3.5 w-3.5 text-text-muted" />
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {game.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="mt-auto border-t border-white/5 px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} ArcadeKit. Built with ❤️
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <Link href="/games" className="hover:text-text-secondary">
              All Games
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
