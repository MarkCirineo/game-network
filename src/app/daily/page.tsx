// ============================================================
// ArcadeKit — Daily Rank (/daily)
// The single-player daily puzzle. The game itself loads in the
// browser (each player gets the puzzle for their own date); the
// how-to-play text below it is server-rendered for search engines.
// ============================================================

import type { Metadata } from "next";
import { DAILY_CATEGORIES } from "@/lib/daily/categories";
import { DAILY_GAME_NAME, DAILY_PATH, DAILY_TAGLINE, MAX_DAY_SCORE, THEMES } from "@/lib/daily/config";
import { DailyGame } from "./DailyGame";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games";

const DESCRIPTION =
  "A free daily ranking puzzle. Each day you get three rounds of five things to put in order, from animals and inventions to planets and countries. New puzzle every day.";

export const metadata: Metadata = {
  title: `${DAILY_GAME_NAME}: Free Daily Ranking Puzzle`,
  description: DESCRIPTION,
  keywords: ["daily puzzle", "ranking game", "daily game", "trivia game", "put in order game", "general knowledge game"],
  openGraph: {
    title: `${DAILY_GAME_NAME}: Free Daily Ranking Puzzle`,
    description: DESCRIPTION,
    url: `${BASE_URL}${DAILY_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${DAILY_GAME_NAME}: Free Daily Ranking Puzzle`,
    description: DESCRIPTION,
  },
  alternates: { canonical: `${BASE_URL}${DAILY_PATH}` },
};

// Only themes the daily puzzle actually uses
const THEME_LIST = [...new Set(DAILY_CATEGORIES.map((category) => category.theme))].map((id) => THEMES[id]);

export default function DailyPage() {
  return (
    <div className="px-4 py-6 md:py-10">
      <div className="mx-auto max-w-md">
        <header className="mb-5">
          <h1 className="font-heading text-2xl font-bold text-foreground">{DAILY_GAME_NAME}</h1>
          <p className="text-sm text-text-secondary">{DAILY_TAGLINE}</p>
        </header>

        <DailyGame />

        <section className="mt-12 space-y-3 text-sm text-text-secondary">
          <h2 className="font-heading text-lg font-semibold text-foreground">How to play</h2>
          <p>
            Every day there&apos;s one new puzzle with three rounds. Each round gives you five things and one
            question, like &ldquo;tallest first&rdquo; or &ldquo;oldest first&rdquo;. Put them in order and lock
            it in to see the real answers.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="text-foreground">Right spot:</span> 2 points 🟩
            </li>
            <li>
              <span className="text-foreground">One spot away:</span> 1 point 🟨
            </li>
            <li>
              <span className="text-foreground">Further away:</span> 0 points ⬜
            </li>
          </ul>
          <p>
            {`That's up to 10 points a round and ${MAX_DAY_SCORE} a day. After the last round you'll see how your score compares with everyone who played today. Everyone gets the same puzzle, and a new one starts at midnight where you are.`}
          </p>
          <p>
            Rounds come from different themes each day:{" "}
            {THEME_LIST.map((theme) => `${theme.emoji} ${theme.name}`).join(", ")}.
          </p>
          <h2 className="pt-4 font-heading text-lg font-semibold text-foreground">Where the numbers come from</h2>
          <p>
            Countries and capitals: GeoNames (geonames.org), CC BY 4.0. Inventions and companies: Wikidata. Planets
            and moons: NASA. Animals, landmarks, famous structures, and famous people: Wikipedia. Every answer links
            to its source.
          </p>
        </section>
      </div>
    </div>
  );
}
