// ============================================================
// ArcadeKit — Rule Out Board Packs Page
// /games/rule-out/packs — every board pack, what it costs, and a
// way to play it. Only the host needs a pack; everyone who joins
// plays it with them, with or without an account. The "packs"
// coming-soon link lands here.
// ============================================================

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, UserRound } from "lucide-react";
import { CreateRoomButton } from "@/components/game/CreateRoomButton";
import { auth } from "@/lib/auth";
import { getCatalogGame } from "@/lib/gameCatalog";
import { packsFor, type PackWithStatus } from "@/lib/packs";
import { getBoard } from "../../../../../shared/boards";

const GAME_ID = "rule-out";
const PACKS_PATH = `/games/${GAME_ID}/packs`;

type Props = {
  params: Promise<{ gameId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const game = getCatalogGame(gameId);
  if (gameId !== GAME_ID || !game) return { title: "Not Found" };
  return {
    title: `${game.name} Board Packs`,
    description: `Themed boards for ${game.name}. Only the host needs a pack: everyone who joins plays it too, no account needed.`,
    alternates: { canonical: PACKS_PATH },
  };
}

function statusLabel(pack: PackWithStatus): string {
  if (pack.access === "free") return "Free";
  if (pack.access === "account") return "Free with an account";
  return pack.owned ? "Owned" : "Paid pack";
}

export default async function PacksPage({ params }: Props) {
  const { gameId } = await params;
  const game = getCatalogGame(gameId);
  if (gameId !== GAME_ID || !game) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const packs = await packsFor(session?.user.id ?? null);

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl">
        <Link
          href={`/games/${GAME_ID}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {game.name}
        </Link>

        <h1 className="mt-4 font-heading text-2xl font-bold leading-tight md:text-3xl">
          {game.emoji} {game.name} board packs
        </h1>
        <p className="mt-2 text-text-secondary">
          Pick a themed board for your next game. Only the host needs the pack: everyone who
          joins plays it with you, no account needed.
        </p>

        {!session && (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-cyan/10 p-4 text-sm">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
            <p>
              <Link
                href={`/sign-in?next=${encodeURIComponent(PACKS_PATH)}`}
                className="font-semibold text-cyan hover:text-cyan/80"
              >
                Sign in or create a free account
              </Link>{" "}
              to play Monster Mash for free. Accounts are optional, and Classic never needs one.
            </p>
          </div>
        )}

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {packs.map((pack) => {
            const board = getBoard(pack.id);
            const locked = pack.status !== "unlocked";
            return (
              <li
                key={pack.id}
                id={pack.id}
                className="flex scroll-mt-20 flex-col rounded-2xl border border-white/5 bg-surface p-4 md:p-5"
              >
                <div className="grid grid-cols-6 gap-1 overflow-hidden rounded-lg">
                  {board.cards.slice(0, 6).map((card) => (
                    <span key={card.id} className="relative aspect-square bg-elevated">
                      <Image src={card.image} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg font-bold">
                    <span aria-hidden="true">{pack.emoji}</span> {pack.name}
                  </h2>
                  <span
                    className={
                      pack.owned || pack.access !== "paid"
                        ? "shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-text-secondary"
                        : "shrink-0 rounded-full bg-amber/10 px-2.5 py-1 text-xs font-medium text-amber"
                    }
                  >
                    {statusLabel(pack)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{pack.tagline}</p>
                <p className="mt-1 text-xs text-text-muted">{board.cards.length} cards</p>

                <div className="mt-4 flex flex-1 items-end">
                  {!locked ? (
                    <CreateRoomButton
                      gameId={GAME_ID}
                      accentColor={game.accentColor}
                      label={`Play ${pack.name}`}
                      initialOptions={{ board: pack.id }}
                    />
                  ) : pack.status === "sign-in" ? (
                    <Link
                      href={`/sign-in?next=${encodeURIComponent(`${PACKS_PATH}#${pack.id}`)}`}
                      className="inline-flex h-12 items-center rounded-xl bg-cyan px-6 text-base font-semibold text-black transition-colors hover:bg-cyan/90"
                    >
                      Sign in to play free
                    </Link>
                  ) : (
                    <span className="inline-flex h-12 items-center gap-2 rounded-xl bg-elevated px-6 text-sm font-semibold text-text-muted">
                      <Lock className="h-4 w-4" />
                      Buying opens soon
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-10 max-w-md text-center text-xs leading-relaxed text-text-secondary">
          Packs you unlock are tied to your account, so they work on any device you sign in on.
        </p>
      </div>
    </div>
  );
}
