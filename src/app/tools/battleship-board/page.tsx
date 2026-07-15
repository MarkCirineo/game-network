// ============================================================
// ArcadeKit — Battleship Board Generator (Server Page)
// Free online battleship board generator — random ship placement.
// ============================================================

import type { Metadata } from "next";
import { BattleshipBoard } from "./BattleshipBoard";

export const metadata: Metadata = {
  title: "Free Online Battleship Board Generator",
  description:
    "Generate random Battleship ship placements and print blank grids for paper play. Standard fleet on a 10×10 grid with clean printable sheets. Free, no sign-up required.",
  keywords: [
    "free online battleship board generator",
    "battleship grid maker",
    "random ship placement",
    "battleship setup generator",
    "printable battleship board",
    "battleship game board",
  ],
  openGraph: {
    title: "Free Online Battleship Board Generator — ArcadeKit",
    description:
      "Generate random ship placements and print blank Battleship grids for paper play. Free and instant.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Battleship Board Generator — ArcadeKit",
    description:
      "Generate random ship placements and print blank Battleship grids for paper play. Free and instant.",
  },
  alternates: {
    canonical: "/tools/battleship-board",
  },
};

export default function BattleshipBoardPage() {
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Online Battleship Board Generator",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games"}/tools/battleship-board`,
    description:
      "Generate random Battleship ship placements and print blank grids for paper play. Standard fleet on a 10×10 grid.",
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
      <section className="bs-screen-only relative px-4 pb-6 pt-10 text-center md:pb-8 md:pt-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-ember/8 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            🚢 Free Tool
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Battleship{" "}
            <span className="gradient-text">Board Generator</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-secondary md:text-base">
            Generate a random ship placement for your fleet, or print blank
            grids for paper Battleship. Standard 10×10 board with color-coded
            fleet positions.
          </p>
        </div>
      </section>

      {/* ── Interactive Tool ─────────────────────────────── */}
      <section className="px-4 pb-12 md:pb-16">
        <BattleshipBoard />
      </section>
    </>
  );
}
