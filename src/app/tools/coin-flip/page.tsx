// ============================================================
// ArcadeKit — Coin Flip (Server Page)
// SEO metadata + renders the client component.
// ============================================================

import type { Metadata } from "next";
import { CoinFlip } from "./CoinFlip";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games";

export const metadata: Metadata = {
  title: "Free Online Coin Flip",
  description:
    "Flip a virtual coin with a stunning 3D animation. Track your flip history, view heads vs tails statistics, monitor streaks, and play Best of N mode. Free, instant, works on any device.",
  keywords: [
    "free online coin flip",
    "coin flip",
    "coin toss",
    "heads or tails",
    "virtual coin flip",
    "flip a coin online",
    "random coin flip",
  ],
  openGraph: {
    title: "Free Online Coin Flip — ArcadeKit",
    description:
      "Flip a virtual coin with 3D animation. Track history, streaks, and statistics. Free, no sign-up.",
    url: `${BASE_URL}/tools/coin-flip`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Coin Flip — ArcadeKit",
    description:
      "Flip a virtual coin with 3D animation. Track history, streaks, and statistics.",
  },
  alternates: {
    canonical: `${BASE_URL}/tools/coin-flip`,
  },
};

export default function CoinFlipPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ArcadeKit Coin Flip",
    url: `${BASE_URL}/tools/coin-flip`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online coin flip with 3D animation, statistics tracking, streaks, and Best of N mode.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CoinFlip />
    </>
  );
}
