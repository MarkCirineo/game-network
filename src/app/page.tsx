// ============================================================
// ArcadeKit — Landing Page
// ============================================================

import Link from "next/link";
import { ArrowRight, Users, Zap, Link as LinkIcon } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 pb-20 pt-16 text-center md:pb-28 md:pt-24">
        {/* Glow background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]" />
          <div className="absolute right-1/4 top-1/3 h-[300px] w-[400px] rounded-full bg-cyan/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-text-secondary backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan animate-pulse" />
            Instant multiplayer games
          </div>

          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Play Games With{" "}
            <span className="gradient-text">Friends</span>
            <br />
            In Seconds
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-text-secondary md:text-lg">
            No downloads. No accounts. Just create a room, share the link, and
            start playing. Instant multiplayer fun in your browser.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/games"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-ember px-8 text-base font-semibold text-white transition-all hover:bg-ember/90 hover:shadow-xl hover:shadow-ember/25 active:scale-[0.98]"
            >
              Start Playing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/games"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-base font-medium text-text-secondary transition-all hover:bg-white/10 hover:text-foreground"
            >
              Browse Games
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/5 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-heading text-2xl font-bold md:text-3xl">
            How It Works
          </h2>
          <p className="mt-2 text-center text-text-secondary">
            Three steps. Zero friction.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                icon: Zap,
                title: "Pick a Game",
                description:
                  "Choose from our collection of instant multiplayer games.",
                color: "text-ember",
                bg: "bg-ember/10",
              },
              {
                step: "2",
                icon: LinkIcon,
                title: "Share the Link",
                description:
                  "Send your unique room link to friends — or have them scan the QR code.",
                color: "text-cyan",
                bg: "bg-cyan/10",
              },
              {
                step: "3",
                icon: Users,
                title: "Play Instantly",
                description:
                  "Everyone joins in their browser. No downloads, no sign-ups required.",
                color: "text-pink",
                bg: "bg-pink/10",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-white/5 bg-surface p-6 transition-all hover:border-white/10 hover:bg-elevated"
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section className="border-t border-white/5 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-heading text-2xl font-bold md:text-3xl">
            Ready to Play
          </h2>
          <p className="mt-2 text-center text-text-secondary">
            Jump into any game in seconds.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                emoji: "❌",
                name: "Tic Tac Toe",
                desc: "Classic strategy — get three in a row",
                href: "/games/tic-tac-toe",
                color: "#3B82F6",
                players: "2 players",
                time: "~2 min",
              },
              {
                emoji: "✊",
                name: "Rock Paper Scissors",
                desc: "Best of 3 — outsmart your opponent",
                href: "/games/rock-paper-scissors",
                color: "#F97316",
                players: "2 players",
                time: "~2 min",
              },
              {
                emoji: "🔍",
                name: "Guess Who",
                desc: "Classic deduction — find the mystery character",
                href: "https://playguesswho.net",
                color: "#F59E0B",
                players: "2 players",
                time: "~10 min",
                external: true,
              },
            ].map((game) => (
              <Link
                key={game.name}
                href={game.href}
                target={game.external ? "_blank" : undefined}
                rel={game.external ? "noopener noreferrer" : undefined}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all hover:border-white/10 hover:shadow-xl"
                style={
                  {
                    "--card-accent": game.color,
                  } as React.CSSProperties
                }
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--card-accent)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="text-3xl">{game.emoji}</span>
                <h3 className="mt-3 font-heading text-lg font-semibold">
                  {game.name}
                  {game.external && (
                    <span className="ml-2 text-xs font-normal text-text-muted">
                      ↗
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">{game.desc}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
                  <span>{game.players}</span>
                  <span>•</span>
                  <span>{game.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} ArcadeKit. Built with ❤️
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <Link href="/games" className="hover:text-text-secondary">
              Games
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
