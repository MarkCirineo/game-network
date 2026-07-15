// ============================================================
// ArcadeKit — Card Shuffler Tool (Server Page)
// Free online card shuffler — shuffle and draw from a 52-card deck.
// ============================================================

import type { Metadata } from "next";
import { CardShuffler } from "./CardShuffler";

export const metadata: Metadata = {
  title: "Free Online Card Shuffler & Deck",
  description:
    "Shuffle a full 52-card deck online and draw cards one at a time. Free virtual card shuffler with flip animations, joker support, and a beautiful visual deck. No app required.",
  keywords: [
    "free online card shuffler",
    "virtual card deck",
    "shuffle deck online",
    "draw cards online",
    "random card draw",
    "playing card shuffler",
  ],
  openGraph: {
    title: "Free Online Card Shuffler & Deck — ArcadeKit",
    description:
      "Shuffle a full 52-card deck online and draw cards with beautiful flip animations. Free, instant, no sign-up.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Card Shuffler & Deck — ArcadeKit",
    description:
      "Shuffle a full 52-card deck online and draw cards with beautiful flip animations.",
  },
  alternates: {
    canonical: "/tools/card-shuffler",
  },
};

export default function CardShufflerPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Online Card Shuffler",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games"}/tools/card-shuffler`,
    description:
      "Shuffle a full 52-card deck online and draw cards. Free virtual card shuffler with joker support.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "ArcadeKit",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative px-4 pb-6 pt-10 text-center md:pb-8 md:pt-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-ember/8 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            🃏 Free Tool
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Card{" "}
            <span className="gradient-text">Shuffler</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-secondary md:text-base">
            Shuffle a full deck of playing cards and draw from the top.
            Beautiful visual cards with flip animations. Optional jokers.
          </p>
        </div>
      </section>

      {/* ── Interactive Tool ─────────────────────────────── */}
      <section className="px-4 pb-12 md:pb-16">
        <CardShuffler />
      </section>
    </>
  );
}
