// ============================================================
// ArcadeKit — Dice Roller (Server Page)
// SEO metadata + renders the client component.
// ============================================================

import type { Metadata } from "next";
import { DiceRoller } from "./DiceRoller";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games";

export const metadata: Metadata = {
  title: "Free Online Dice Roller",
  description:
    "Roll any combination of dice instantly — d4, d6, d8, d10, d12, d20, d100. Add modifiers, use presets like 2d6 or 4d6 drop lowest, and track your roll history. Free, fast, and works on any device.",
  keywords: [
    "free online dice roller",
    "dice roller",
    "d20 roller",
    "virtual dice",
    "RPG dice roller",
    "DnD dice roller",
    "roll dice online",
    "tabletop dice",
  ],
  openGraph: {
    title: "Free Online Dice Roller — ArcadeKit",
    description:
      "Roll any dice instantly — d4 through d100 with modifiers and presets. Free, no sign-up required.",
    url: `${BASE_URL}/tools/dice-roller`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Dice Roller — ArcadeKit",
    description:
      "Roll any dice instantly — d4 through d100 with modifiers and presets.",
  },
  alternates: {
    canonical: `${BASE_URL}/tools/dice-roller`,
  },
};

export default function DiceRollerPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ArcadeKit Dice Roller",
    url: `${BASE_URL}/tools/dice-roller`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online dice roller supporting d4, d6, d8, d10, d12, d20, and d100 with modifiers and roll history.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DiceRoller />
    </>
  );
}
