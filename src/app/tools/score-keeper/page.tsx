// ============================================================
// ArcadeKit — Score Keeper Tool (Server wrapper)
// SEO metadata + renders client component.
// ============================================================

import type { Metadata } from "next";
import ScoreKeeper from "./ScoreKeeper";

export const metadata: Metadata = {
  title: "Score Keeper — Free Online Score Tracker",
  description:
    "Free online score keeper and tracker for any game. Add players, track scores with round history, undo actions, and customize point increments. No sign-up required.",
  keywords: [
    "free online score keeper",
    "score tracker",
    "game score counter",
    "score board",
    "point tracker",
    "multiplayer score keeper",
  ],
  openGraph: {
    title: "Score Keeper — Free Online Score Tracker | ArcadeKit",
    description:
      "Track scores for any game with round history, player stats, and customizable increments. Free, instant, no sign-up.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Score Keeper — Free Online Score Tracker | ArcadeKit",
    description:
      "Track scores for any game with round history, player stats, and customizable increments. Free, instant, no sign-up.",
  },
};

export default function ScoreKeeperPage() {
  return <ScoreKeeper />;
}
