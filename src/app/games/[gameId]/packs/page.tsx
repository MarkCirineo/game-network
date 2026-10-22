// ============================================================
// ArcadeKit — Rule Out Board Packs Page
// /games/rule-out/packs — every board pack, what it costs, and a
// way to play or buy it. Only the host needs a pack; everyone who
// joins plays it with them, with or without an account. The "packs"
// coming-soon link lands here, and so does Stripe after a checkout
// (?checkout=<session id>), which records the purchase if the
// webhook hasn't yet.
// ============================================================

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Layers, UserRound } from "lucide-react";
import { CreateRoomButton } from "@/components/game/CreateRoomButton";
import { auth } from "@/lib/auth";
import { getCatalogGame } from "@/lib/gameCatalog";
import { packsFor, type PackWithStatus } from "@/lib/packs";
import { fulfillCheckout, type FulfilledCheckout } from "@/lib/packPurchases";
import { stripeConfigured } from "@/lib/stripe";
import { getBoard } from "../../../../../shared/boards";
import { bundlePriceCents, formatPrice, getPack } from "../../../../../shared/boards/packs";
import { BuyButton } from "./BuyButton";
import { PurchaseTracker } from "./PurchaseTracker";

const GAME_ID = "rule-out";
const PACKS_PATH = `/games/${GAME_ID}/packs`;

type Props = {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  return pack.owned ? "Owned" : formatPrice(pack.priceCents ?? 0);
}

/** Record a checkout the buyer just came back from, if it's theirs and paid */
async function checkoutResult(raw: unknown, userId: string | null): Promise<FulfilledCheckout | null> {
  if (!userId || typeof raw !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(raw)) return null;
  try {
    const result = await fulfillCheckout(raw);
    return result?.userId === userId ? result : null;
  } catch (error) {
    console.error("[packs] checkout return", error);
    return null;
  }
}

export default async function PacksPage({ params, searchParams }: Props) {
  const { gameId } = await params;
  const game = getCatalogGame(gameId);
  if (gameId !== GAME_ID || !game) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;
  const checkoutId = (await searchParams).checkout;
  const purchase = await checkoutResult(checkoutId, userId);
  const packs = await packsFor(userId);

  const owned = new Set(packs.filter((p) => p.owned).map((p) => p.id));
  const bundlePrice = bundlePriceCents(owned);
  const bundlePacks = packs.filter((p) => p.access === "paid" && !p.owned);
  const bundleSeparately = bundlePacks.reduce((sum, p) => sum + (p.priceCents ?? 0), 0);
  const buyingOpen = stripeConfigured();
  const signInHref = (hash = "") => `/sign-in?next=${encodeURIComponent(`${PACKS_PATH}${hash}`)}`;

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

        {purchase && typeof checkoutId === "string" && (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber/10 p-4 text-sm">
            <PurchaseTracker checkoutId={checkoutId} packIds={purchase.packIds} />
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <p>
              <strong className="text-text-primary">Thanks for your purchase!</strong>{" "}
              {purchase.packIds.map((id) => getPack(id)?.name).join(" and ")}{" "}
              {purchase.packIds.length === 1 ? "is" : "are"} now yours. Pick{" "}
              {purchase.packIds.length === 1 ? "it" : "them"} in the lobby when you host a game.
            </p>
          </div>
        )}

        {!session && (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-cyan/10 p-4 text-sm">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
            <p>
              <Link href={signInHref()} className="font-semibold text-cyan hover:text-cyan/80">
                Sign in or create a free account
              </Link>{" "}
              to play Monster Mash for free. Accounts are optional, and Classic never needs one.
            </p>
          </div>
        )}

        {/* All the paid packs the viewer is missing, for less */}
        {bundlePrice !== null && (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber/20 bg-amber/5 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="flex items-start gap-3">
              <Layers className="mt-1 h-5 w-5 shrink-0 text-amber" />
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {owned.size > 0 ? "Complete your collection" : "Get every pack"}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {bundlePacks.map((p) => `${p.emoji} ${p.name}`).join(" + ")} for{" "}
                  <strong className="text-text-primary">{formatPrice(bundlePrice)}</strong>
                  {bundleSeparately > bundlePrice && (
                    <> instead of {formatPrice(bundleSeparately)} separately</>
                  )}
                  . Yours to keep.
                </p>
              </div>
            </div>
            {!session ? (
              <Link
                href={signInHref()}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-amber px-6 text-base font-semibold text-black transition-colors hover:bg-amber/90"
              >
                Sign in to buy
              </Link>
            ) : buyingOpen ? (
              <BuyButton item="bundle" label={`Buy all for ${formatPrice(bundlePrice)}`} />
            ) : null}
          </section>
        )}

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {packs.map((pack) => {
            const board = getBoard(pack.id);
            const isPaid = pack.access === "paid";
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
                      isPaid && !pack.owned
                        ? "shrink-0 rounded-full bg-amber/10 px-2.5 py-1 text-xs font-medium text-amber"
                        : "shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-text-secondary"
                    }
                  >
                    {statusLabel(pack)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{pack.tagline}</p>
                <p className="mt-1 text-xs text-text-muted">{board.cards.length} cards</p>

                <div className="mt-4 flex flex-1 items-end">
                  {pack.status === "unlocked" ? (
                    <CreateRoomButton
                      gameId={GAME_ID}
                      accentColor={game.accentColor}
                      label={`Play ${pack.name}`}
                      initialOptions={{ board: pack.id }}
                    />
                  ) : pack.status === "sign-in" ? (
                    <Link
                      href={signInHref(`#${pack.id}`)}
                      className="inline-flex h-12 items-center rounded-xl bg-cyan px-6 text-base font-semibold text-black transition-colors hover:bg-cyan/90"
                    >
                      Sign in to play free
                    </Link>
                  ) : !session ? (
                    <Link
                      href={signInHref(`#${pack.id}`)}
                      className="inline-flex h-12 items-center rounded-xl border border-amber/40 px-6 text-base font-semibold text-amber transition-colors hover:bg-amber/10"
                    >
                      Sign in to buy
                    </Link>
                  ) : buyingOpen ? (
                    <BuyButton item={pack.id} label={`Buy for ${formatPrice(pack.priceCents ?? 0)}`} />
                  ) : (
                    <span className="inline-flex h-12 items-center rounded-xl bg-elevated px-6 text-sm font-semibold text-text-muted">
                      Buying opens soon
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto mt-10 max-w-md space-y-2 text-center text-xs leading-relaxed text-text-secondary">
          <p>
            Packs you buy are tied to your account, so they work on any device you sign in on.
            They&apos;re yours to keep: there&apos;s no subscription.
          </p>
          <p>
            Prices are in US dollars. Stripe handles payment and adds sales tax or VAT at
            checkout where it applies.
          </p>
          <p>
            Not happy with a pack? Ask within 14 days for a refund.{" "}
            <Link href="/terms#purchases" className="text-ember hover:text-ember/80">
              Purchase terms
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
