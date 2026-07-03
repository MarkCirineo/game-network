// ============================================================
// ArcadeKit — About Page
// Long-form about page for AdSense compliance & SEO.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import {
  Gamepad2,
  Users,
  Zap,
  Share2,
  Heart,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "ArcadeKit is a free multiplayer browser gaming platform. Play instant games with friends — no downloads, no sign-ups. Learn about our mission, our games, and how it all works.",
  openGraph: {
    title: "About ArcadeKit",
    description:
      "Free instant multiplayer browser games. No downloads, no accounts. Just play.",
  },
};

const games = [
  { emoji: "❌", name: "Tic-Tac-Toe", players: "2 players", href: "/games/tic-tac-toe" },
  { emoji: "✊", name: "Rock Paper Scissors", players: "2 players", href: "/games/rock-paper-scissors" },
  { emoji: "🔴", name: "Connect Four", players: "2 players", href: "/games/connect-four" },
  { emoji: "🚢", name: "Battleship", players: "2 players", href: "/games/battleship" },
  { emoji: "🔤", name: "Word Scramble", players: "2–8 players", href: "/games/word-scramble" },
  { emoji: "⚡", name: "Reaction Race", players: "2–8 players", href: "/games/reaction-race" },
];

const steps = [
  {
    icon: Gamepad2,
    title: "Pick a game",
    description: "Browse our catalog and choose a game you and your friends want to play.",
  },
  {
    icon: Share2,
    title: "Share the link",
    description: "Create a room and send the invite link to anyone — works on any device with a browser.",
  },
  {
    icon: Zap,
    title: "Play instantly",
    description: "No downloads, no accounts, no waiting. Everyone joins and the game starts immediately.",
  },
];

export default function AboutPage() {
  // Organization structured data for SEO
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ArcadeKit",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games",
    description:
      "Free instant multiplayer browser games. Play with friends — no downloads, no sign-ups.",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games"}/icon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@arcadekit.games",
      contactType: "customer support",
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative px-4 pb-8 pt-12 text-center md:pb-12 md:pt-16">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-ember/8 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            <Gamepad2 className="h-4 w-4 text-ember" />
            Free &amp; Open for Everyone
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            About{" "}
            <span className="gradient-text">ArcadeKit</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary md:text-lg">
            Instant multiplayer browser games you can play with friends. No
            downloads, no sign-ups, no friction. Just fun.
          </p>
        </div>
      </section>

      {/* ── What is ArcadeKit? ───────────────────────────── */}
      <section className="px-4 pb-10 md:pb-14">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/5 bg-surface p-6 md:p-8">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">
              What is ArcadeKit?
            </h2>
            <div className="mt-4 space-y-4 text-text-secondary leading-relaxed">
              <p>
                ArcadeKit is a free multiplayer gaming platform built for the
                browser. We believe playing games with friends should be{" "}
                <strong className="text-text-primary">effortless</strong> — no
                app store downloads, no account creation, no software installs.
              </p>
              <p>
                Whether you&apos;re killing time with a co-worker, hanging out
                with friends across the world, or looking for a quick party game,
                ArcadeKit gets you playing in seconds. Just pick a game, share a
                link, and go.
              </p>
              <p>
                Everything runs right in your browser. Desktop, tablet, phone —
                if it has a web browser, it works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission ──────────────────────────────────── */}
      <section className="px-4 pb-10 md:pb-14">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/5 bg-surface p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember/10">
                <Heart className="h-5 w-5 text-ember" />
              </div>
              <h2 className="font-heading text-2xl font-bold md:text-3xl">
                Our Mission
              </h2>
            </div>
            <div className="mt-4 space-y-4 text-text-secondary leading-relaxed">
              <p>
                We&apos;re on a simple mission:{" "}
                <strong className="text-text-primary">
                  make it ridiculously easy to play games with friends online.
                </strong>
              </p>
              <p>
                Too many gaming platforms are bloated with accounts, downloads,
                paywalls, and ads that get in the way. ArcadeKit strips all of
                that away. We want you in a game with your friends within 10
                seconds of arriving on the site.
              </p>
              <p>
                Every game is free. Every game works on every device. Every game
                is multiplayer. That&apos;s the promise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="px-4 pb-10 md:pb-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center font-heading text-2xl font-bold md:text-3xl">
            How It Works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/5 bg-surface p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ember/10">
                  <step.icon className="h-6 w-6 text-ember" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Step {i + 1}
                </div>
                <h3 className="font-heading text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Games ────────────────────────────────────── */}
      <section className="px-4 pb-10 md:pb-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ember" />
            <h2 className="font-heading text-2xl font-bold md:text-3xl">
              Our Games
            </h2>
          </div>
          <p className="mb-6 text-text-secondary">
            We&apos;re building a growing library of multiplayer games. Here&apos;s
            what&apos;s available right now:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Link
                key={game.name}
                href={game.href}
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface p-4 transition-all hover:border-white/10 hover:bg-elevated"
              >
                <span className="text-3xl">{game.emoji}</span>
                <div>
                  <h3 className="font-heading text-sm font-bold group-hover:text-ember transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-xs text-text-muted">{game.players}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Partner game */}
          <div className="mt-6 rounded-2xl border border-white/5 bg-surface p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <ExternalLink className="h-3.5 w-3.5" />
              Partner Game
            </div>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-3xl">🔍</span>
              <div>
                <a
                  href="https://playguesswho.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading text-base font-bold text-ember hover:text-ember/80 transition-colors"
                >
                  Guess Who
                  <ExternalLink className="ml-1.5 inline h-3.5 w-3.5" />
                </a>
                <p className="mt-0.5 text-sm text-text-secondary">
                  Classic deduction — figure out your opponent&apos;s mystery
                  character. Hosted on{" "}
                  <a
                    href="https://playguesswho.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ember hover:text-ember/80"
                  >
                    playguesswho.net
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Built With Love ──────────────────────────────── */}
      <section className="px-4 pb-10 md:pb-14">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/5 bg-surface p-6 text-center md:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ember/10">
              <Users className="h-6 w-6 text-ember" />
            </div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">
              Built for the Gaming Community
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-text-secondary leading-relaxed">
              ArcadeKit is built with love by people who just want to play games
              with their friends without jumping through hoops. We&apos;re always
              adding new games and listening to feedback. If you have an idea,
              want to report a bug, or just want to say hi — reach out at{" "}
              <a
                href="mailto:support@arcadekit.games"
                className="text-ember hover:text-ember/80"
              >
                support@arcadekit.games
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── CTAs ─────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-4 py-10 md:py-14">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
          <Link
            href="/games"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-ember px-6 text-sm font-medium text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
          >
            Browse Games
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-surface px-6 text-sm font-medium text-text-secondary transition-all hover:border-white/20 hover:text-text-primary"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
