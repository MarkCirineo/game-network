// ============================================================
// ArcadeKit — Coming-Soon Page
// /coming-soon?feature=custom-boards | stats | packs
// External sites link to these exact URLs, so a missing or unknown
// feature falls back to a general page instead of a 404.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Layers, PencilLine, Sparkles, Trophy } from "lucide-react";
import {
  FEATURES,
  LIVE_FEATURE_PATHS,
  PLANNED_FEATURE_KEYS,
  parseFeature,
  type FeatureKey,
} from "@/lib/comingSoon";
import { gameCatalog } from "@/lib/gameCatalog";
import { ComingSoonTracker } from "./ComingSoonTracker";
import { InterestButton } from "./InterestButton";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Icon + color per feature (full class strings so Tailwind picks them up)
const FEATURE_STYLE: Record<FeatureKey, { icon: LucideIcon; tone: string }> = {
  "custom-boards": { icon: PencilLine, tone: "bg-pink/10 text-pink" },
  stats: { icon: Trophy, tone: "bg-cyan/10 text-cyan" },
  packs: { icon: Layers, tone: "bg-amber/10 text-amber" },
};

const GENERAL_TITLE = "New features are on the way";
const GENERAL_SUMMARY =
  "We're planning a few extras for ArcadeKit. None of them are ready yet. Tell us which ones you'd use.";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { key } = parseFeature((await searchParams).feature);
  const feature = key ? FEATURES[key] : null;

  return {
    title: feature ? `${feature.title} — Coming Soon` : "Coming Soon",
    description: feature ? feature.summary : GENERAL_SUMMARY,
    // Thin, query-driven page — keep it out of search results
    robots: { index: false, follow: true },
  };
}

export default async function ComingSoonPage({ searchParams }: Props) {
  const params = await searchParams;
  const { key, tracked } = parseFeature(params.feature);

  // Launched: send the link straight to the feature, keeping utm_* etc.
  // so analytics still sees where the visit came from
  const livePath = key ? LIVE_FEATURE_PATHS[key] : undefined;
  if (livePath) redirect(withQuery(livePath, params));

  const feature = key ? FEATURES[key] : null;
  const otherKeys = PLANNED_FEATURE_KEYS.filter((k) => k !== key);

  return (
    <div className="px-4 py-8 md:py-12">
      <ComingSoonTracker feature={tracked} />

      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl">
        {/* Phone: stacked. Desktop: feature card beside the planned list */}
        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-6">
          {/* ── Feature ─────────────────────────────────────── */}
          <section className="rounded-2xl border border-white/5 bg-surface p-6 md:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ember">
              <Sparkles className="h-3.5 w-3.5" />
              Coming soon
            </span>

            {feature && key ? (
              <>
                <FeatureIcon featureKey={key} className="mt-5 h-12 w-12" />
                <h1 className="mt-4 font-heading text-2xl font-bold leading-tight md:text-3xl">
                  {feature.title}
                </h1>
                <p className="mt-2 text-text-secondary">{feature.summary}</p>

                <h2 className="mt-5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  What we&apos;re planning
                </h2>
                <ul className="mt-2 space-y-2">
                  {feature.plans.map((plan) => (
                    <li key={plan} className="flex gap-2.5 text-sm text-text-primary">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                      {plan}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <InterestButton feature={key} from={tracked} placement="main" />
                </div>
              </>
            ) : (
              <>
                <h1 className="mt-4 font-heading text-2xl font-bold leading-tight md:text-3xl">
                  {GENERAL_TITLE}
                </h1>
                <p className="mt-2 text-text-secondary">{GENERAL_SUMMARY}</p>
              </>
            )}

            <div className="mt-6 rounded-xl bg-white/5 p-4 text-sm text-text-secondary">
              <p>
                <strong className="text-text-primary">Not ready yet.</strong>{" "}
                There&apos;s no release date.
              </p>
              <p className="mt-2">
                {feature
                  ? "When it's ready, this same link will take you straight to it."
                  : "When a feature is ready, this page will link to it."}
              </p>
            </div>
          </section>

          {/* ── Other planned features ──────────────────────── */}
          <section className="mt-8 lg:mt-0">
            <h2 className="font-heading text-lg font-semibold">
              {feature ? "Also planned" : "Planned features"}
            </h2>
            <ul className="mt-3 space-y-3">
              {otherKeys.map((otherKey) => {
                const other = FEATURES[otherKey];
                return (
                  <li
                    key={otherKey}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-surface p-4"
                  >
                    <FeatureIcon featureKey={otherKey} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{other.title}</p>
                      <p className="text-xs text-text-secondary">{other.summary}</p>
                    </div>
                    <InterestButton feature={otherKey} from={tracked} placement="list" />
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* ── Play now ────────────────────────────────────── */}
        <section className="mt-10 md:mt-14">
          <h2 className="font-heading text-lg font-semibold">
            Play something now
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Every game is free and works without an account. Create a room,
            share the link, and play.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gameCatalog.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                data-umami-event="coming-soon-play"
                data-umami-event-game={game.id}
                data-umami-event-feature={tracked}
                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface p-4 transition-colors hover:border-white/15 active:bg-elevated"
              >
                <span className="text-3xl" aria-hidden="true">
                  {game.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold">{game.name}</p>
                  <p className="text-xs text-text-secondary">
                    {game.players} · {game.duration}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <Link
            href="/games"
            className="mx-auto mt-5 flex h-12 w-full items-center justify-center rounded-xl sm:w-64 bg-ember text-sm font-semibold text-white transition-colors hover:bg-ember/90"
          >
            See all games
          </Link>
        </section>

        {/* ── About ───────────────────────────────────────── */}
        <p className="mx-auto mt-10 max-w-md text-center text-xs leading-relaxed text-text-secondary">
          ArcadeKit is a free collection of multiplayer browser games, built by
          the same solo developer as the game you came from.{" "}
          <Link href="/about" className="text-ember hover:text-ember/80">
            About ArcadeKit
          </Link>
        </p>
      </div>
    </div>
  );
}

/** The path plus every query parameter except "feature" */
function withQuery(
  path: string,
  params: { [key: string]: string | string[] | undefined },
): string {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (name === "feature" || value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) query.append(name, v);
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

function FeatureIcon({
  featureKey,
  className,
}: {
  featureKey: FeatureKey;
  className: string;
}) {
  const { icon: Icon, tone } = FEATURE_STYLE[featureKey];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${tone} ${className}`}
    >
      <Icon className="h-1/2 w-1/2" />
    </div>
  );
}
