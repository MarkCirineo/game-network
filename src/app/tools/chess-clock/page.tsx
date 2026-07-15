// ============================================================
// ArcadeKit — Chess Clock (Server Page)
// SEO metadata + renders the client component.
// ============================================================

import type { Metadata } from "next";
import { ChessClock } from "./ChessClock";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games";

export const metadata: Metadata = {
  title: "Free Online Chess Clock Timer",
  description:
    "A beautiful free online chess clock with Bullet, Blitz, Rapid, and Classical presets. Supports custom time controls with increment, move counters, fullscreen mode, and sound alerts. Works on any device.",
  keywords: [
    "free online chess clock",
    "chess clock timer",
    "chess timer",
    "blitz chess clock",
    "rapid chess timer",
    "online chess clock",
    "game timer",
    "chess clock app",
  ],
  openGraph: {
    title: "Free Online Chess Clock Timer — ArcadeKit",
    description:
      "Beautiful chess clock with presets, increment support, fullscreen mode, and sound alerts. Free, no sign-up.",
    url: `${BASE_URL}/tools/chess-clock`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Chess Clock Timer — ArcadeKit",
    description:
      "Beautiful chess clock with presets, increment support, fullscreen mode, and sound alerts.",
  },
  alternates: {
    canonical: `${BASE_URL}/tools/chess-clock`,
  },
};

export default function ChessClockPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ArcadeKit Chess Clock",
    url: `${BASE_URL}/tools/chess-clock`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online chess clock timer with Bullet, Blitz, Rapid, Classical presets and custom time controls with increment support.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ChessClock />
    </>
  );
}
