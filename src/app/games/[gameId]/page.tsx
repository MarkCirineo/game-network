// ============================================================
// ArcadeKit — Game Detail Page (Dynamic)
// SSR page with SEO metadata per game.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, Users } from "lucide-react";
import { CreateRoomButton } from "@/components/game/CreateRoomButton";
import { gameCatalog, getCatalogGame } from "@/lib/gameCatalog";

type Props = {
  params: Promise<{ gameId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const game = getCatalogGame(gameId);
  if (!game) return { title: "Game Not Found" };

  return {
    title: game.name,
    description: game.description,
    openGraph: {
      title: `${game.name} — Play Free Online | ArcadeKit`,
      description: game.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.name} — Play Free Online`,
      description: game.description,
    },
  };
}

export function generateStaticParams() {
  return gameCatalog.map((game) => ({ gameId: game.id }));
}

export default async function GameDetailPage({ params }: Props) {
  const { gameId } = await params;
  const game = getCatalogGame(gameId);

  if (!game) {
    notFound();
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/games"
          className="mb-6 inline-flex items-center text-sm text-text-secondary hover:text-foreground"
        >
          ← All Games
        </Link>

        {/* Game Header */}
        <div className="text-center">
          <span className="text-5xl">{game.emoji}</span>
          <h1 className="mt-4 font-heading text-3xl font-bold md:text-4xl">
            {game.name}
          </h1>
          <p className="mt-3 text-text-secondary">{game.description}</p>

          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {game.players}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {game.duration}
            </span>
          </div>
        </div>

        {/* Create Room CTA */}
        <div className="mt-8 flex justify-center">
          <CreateRoomButton gameId={game.id} accentColor={game.accentColor} />
        </div>

        {/* Rules */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold">How to Play</h2>
          <ul className="mt-4 space-y-3">
            {game.rules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-secondary">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-text-muted">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Full guide link */}
        <Link
          href={`/games/${game.id}/how-to-play`}
          className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-surface p-5 transition-colors hover:border-white/15"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-ember" />
            <div>
              <p className="text-sm font-semibold">
                Full {game.name} Guide
              </p>
              <p className="text-xs text-text-muted">
                History, strategy tips, variations &amp; FAQ
              </p>
            </div>
          </div>
          <span className="text-text-muted">→</span>
        </Link>

        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
