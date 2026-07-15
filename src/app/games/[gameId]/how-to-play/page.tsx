// ============================================================
// ArcadeKit — How to Play Guide (Dynamic)
// Long-form SEO guide per game: history, rules, strategy,
// variations, FAQ, and (when the affiliate tag is set) gear.
// Emits HowTo + FAQPage + BreadcrumbList structured data.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Play, Wrench } from "lucide-react";
import { getGuide, allGuides, guideIds } from "@/lib/content/game-guides";
import { TableOfContents, type TocItem } from "@/components/content/TableOfContents";
import { AffiliateLink } from "@/components/content/AffiliateLink";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games";
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG;

type Props = {
  params: Promise<{ gameId: string }>;
};

export function generateStaticParams() {
  return guideIds().map((gameId) => ({ gameId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const guide = getGuide(gameId);
  if (!guide) return { title: "Guide Not Found" };

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: {
      canonical: `/games/${guide.gameId}/how-to-play`,
    },
    openGraph: {
      title: `${guide.metaTitle} | ArcadeKit`,
      description: guide.metaDescription,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
  };
}

function formatUpdated(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function HowToPlayPage({ params }: Props) {
  const { gameId } = await params;
  const guide = getGuide(gameId);

  if (!guide) {
    notFound();
  }

  const showGear = Boolean(AMAZON_TAG) && guide.gear.items.length > 0;
  const guideUrl = `${SITE_URL}/games/${guide.gameId}/how-to-play`;

  const tocItems: TocItem[] = [
    { id: "history", title: "History & Origins" },
    { id: "rules", title: "Rules, Step by Step" },
    { id: "strategy", title: "Strategy & Tips" },
    { id: "variations", title: "Variations" },
    { id: "faq", title: "FAQ" },
    ...(showGear ? [{ id: "gear", title: "Recommended Gear" }] : []),
  ];

  // ── Structured data: BreadcrumbList + HowTo + FAQPage ──
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Games", item: `${SITE_URL}/games` },
        {
          "@type": "ListItem",
          position: 3,
          name: guide.gameName,
          item: `${SITE_URL}/games/${guide.gameId}`,
        },
        { "@type": "ListItem", position: 4, name: "How to Play", item: guideUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to Play ${guide.gameName}`,
      description: guide.metaDescription,
      totalTime: `PT${guide.totalTimeMinutes}M`,
      step: guide.rules.steps.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: step.name,
        text: step.text,
        url: `${guideUrl}#rules`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  const otherGuides = allGuides().filter((g) => g.gameId !== guide.gameId);

  return (
    <div className="px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Games", href: "/games" },
            { label: guide.gameName, href: `/games/${guide.gameId}` },
            { label: "How to Play" },
          ]}
        />

        {/* ── Hero ─────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: `${guide.accentColor}1A` }}
            >
              {guide.emoji}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                How to Play {guide.gameName}
              </h1>
              <p className="mt-2 text-text-secondary md:text-lg">
                {guide.heroTagline}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href={`/games/${guide.gameId}`}
              className="flex h-11 items-center gap-2 rounded-xl bg-ember px-6 text-sm font-semibold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
            >
              <Play className="h-4 w-4" />
              Play {guide.gameName} Free
            </Link>
            <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
              <Clock className="h-4 w-4" />
              Updated {formatUpdated(guide.updated)}
            </span>
          </div>
        </header>

        {/* ── Content grid ─────────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          <aside>
            <TableOfContents items={tocItems} />
          </aside>

          <article className="min-w-0 max-w-3xl">
            {/* Intro */}
            <div className="space-y-4">
              {guide.intro.map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* History */}
            <section id="history" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold">
                History &amp; Origins
              </h2>
              <div className="mt-4 space-y-4">
                {guide.history.map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-text-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Rules */}
            <section id="rules" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold">
                Rules, Step by Step
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                {guide.rules.intro}
              </p>
              <ol className="mt-6 space-y-4">
                {guide.rules.steps.map((step, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-white/5 bg-surface p-5"
                  >
                    <div className="flex gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember/10 text-sm font-bold text-ember">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-heading font-semibold">
                          {step.name}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Strategy */}
            <section id="strategy" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold">
                Strategy &amp; Tips
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                {guide.strategy.intro}
              </p>
              <div className="mt-6 space-y-4">
                {guide.strategy.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/5 bg-surface p-5"
                  >
                    <h3 className="font-heading font-semibold">{tip.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Variations */}
            <section id="variations" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold">
                Variations &amp; House Rules
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                {guide.variations.intro}
              </p>
              <ul className="mt-6 space-y-4">
                {guide.variations.items.map((variation, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-white/5 bg-surface p-5"
                  >
                    <h3 className="font-heading font-semibold">
                      {variation.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {variation.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Related tool */}
            {guide.relatedTool && (
              <div className="mt-12 rounded-2xl border border-ember/20 bg-ember/5 p-5">
                <div className="flex items-start gap-3">
                  <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                  <div>
                    <h3 className="font-heading font-semibold">
                      Free tool: {guide.relatedTool.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {guide.relatedTool.blurb}
                    </p>
                    <Link
                      href={`/tools/${guide.relatedTool.slug}`}
                      className="mt-2 inline-block text-sm font-medium text-ember hover:text-ember/80"
                    >
                      Open {guide.relatedTool.name} →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            <section id="faq" className="mt-12 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold">
                Frequently Asked Questions
              </h2>
              <div className="mt-6 space-y-6">
                {guide.faq.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-heading font-semibold">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Gear (affiliate — only when NEXT_PUBLIC_AMAZON_TAG is set) */}
            {showGear && (
              <section id="gear" className="mt-12 scroll-mt-24">
                <h2 className="font-heading text-2xl font-bold">
                  Recommended Gear
                </h2>
                <p className="mt-4 leading-relaxed text-text-secondary">
                  {guide.gear.intro}
                </p>
                <div className="mt-6 space-y-4">
                  {guide.gear.items.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/5 bg-surface p-5"
                    >
                      <h3 className="font-heading font-semibold">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                        {item.blurb}
                      </p>
                      <div className="mt-2">
                        <AffiliateLink
                          searchQuery={item.searchQuery}
                          productName={item.name}
                        >
                          Check price on Amazon
                        </AffiliateLink>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-text-muted">
                  As an Amazon Associate, ArcadeKit earns from qualifying
                  purchases. Product links above are affiliate links — they
                  cost you nothing and help keep our games free.
                </p>
              </section>
            )}

            {/* Bottom CTA */}
            <div className="mt-14 rounded-2xl border border-white/5 bg-surface p-8 text-center">
              <span className="text-4xl">{guide.emoji}</span>
              <h2 className="mt-3 font-heading text-xl font-bold">
                Ready to play {guide.gameName}?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                No downloads, no accounts. Create a room, share the link with a
                friend, and start playing in seconds.
              </p>
              <div className="mt-5 flex justify-center">
                <Link
                  href={`/games/${guide.gameId}`}
                  className="flex h-11 items-center gap-2 rounded-xl bg-ember px-6 text-sm font-semibold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
                >
                  <Play className="h-4 w-4" />
                  Play Free Now
                </Link>
              </div>
            </div>

            {/* More guides */}
            <div className="mt-12">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
                More Game Guides
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherGuides.map((other) => (
                  <Link
                    key={other.gameId}
                    href={`/games/${other.gameId}/how-to-play`}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface px-4 py-3 transition-colors hover:border-white/15"
                  >
                    <span className="text-xl">{other.emoji}</span>
                    <span className="text-sm font-medium text-text-secondary">
                      How to Play {other.gameName}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
