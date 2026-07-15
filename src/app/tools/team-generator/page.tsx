// ============================================================
// ArcadeKit — Team Generator Tool (Server Page)
// Free random team generator — split players into balanced teams.
// ============================================================

import type { Metadata } from "next";
import { TeamGenerator } from "./TeamGenerator";

export const metadata: Metadata = {
  title: "Free Random Team Generator",
  description:
    "Split players into random teams instantly. Free online team generator for sports, games, classrooms, and more. No sign-up required — just add names and generate.",
  keywords: [
    "free random team generator",
    "team randomizer",
    "split into teams",
    "random group maker",
    "team picker",
    "random team maker online",
  ],
  openGraph: {
    title: "Free Random Team Generator — ArcadeKit",
    description:
      "Add player names, pick the number of teams, and generate random balanced teams in one click. Free, fast, no sign-up.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Random Team Generator — ArcadeKit",
    description:
      "Add player names, pick the number of teams, and generate random balanced teams in one click.",
  },
  alternates: {
    canonical: "/tools/team-generator",
  },
};

export default function TeamGeneratorPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Random Team Generator",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games"}/tools/team-generator`,
    description:
      "Split players into random teams instantly. Free online team generator for sports, games, classrooms, and more.",
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
            🎲 Free Tool
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Random{" "}
            <span className="gradient-text">Team Generator</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-secondary md:text-base">
            Add player names, choose the number of teams, and generate
            random balanced teams instantly. Perfect for sports, games,
            classrooms, and team-building.
          </p>
        </div>
      </section>

      {/* ── Interactive Tool ─────────────────────────────── */}
      <section className="px-4 pb-12 md:pb-16">
        <TeamGenerator />
      </section>
    </>
  );
}
