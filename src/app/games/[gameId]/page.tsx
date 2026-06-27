// ============================================================
// ArcadeKit — Game Detail Page (Dynamic)
// SSR page with SEO metadata per game.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users } from "lucide-react";
import { CreateRoomButton } from "@/components/game/CreateRoomButton";

// Static game data for SSR (avoids importing client-side registry)
const gameData: Record<
  string,
  {
    id: string;
    name: string;
    emoji: string;
    description: string;
    shortDescription: string;
    accentColor: string;
    minPlayers: number;
    maxPlayers: number;
    estimatedDuration: string;
    category: string;
    rules: string[];
    tags: string[];
  }
> = {
  "tic-tac-toe": {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    emoji: "❌",
    description:
      "The classic strategy game. Take turns placing X's and O's on a 3×3 grid. First to get three in a row wins!",
    shortDescription: "Classic strategy — get three in a row to win",
    accentColor: "#3B82F6",
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: "~2 min",
    category: "strategy",
    rules: [
      "Players take turns placing their mark (X or O) on the board",
      "First player to get 3 marks in a row (horizontal, vertical, or diagonal) wins",
      "If all 9 squares are filled with no winner, it's a draw",
    ],
    tags: ["classic", "strategy", "two-player"],
  },
  "rock-paper-scissors": {
    id: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    emoji: "✊",
    description:
      "The ultimate showdown of wits. Choose rock, paper, or scissors simultaneously. Best of 3 rounds wins the match!",
    shortDescription: "Best of 3 showdown — outsmart your opponent",
    accentColor: "#F97316",
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: "~2 min",
    category: "quick",
    rules: [
      "Both players choose rock, paper, or scissors simultaneously",
      "Rock beats scissors, scissors beats paper, paper beats rock",
      "First player to win 2 rounds wins the match",
    ],
    tags: ["classic", "quick", "two-player"],
  },
  "connect-four": {
    id: "connect-four",
    name: "Connect Four",
    emoji: "🔴",
    description:
      "The classic disc-dropping strategy game. Take turns dropping colored discs into a 7-column grid — connect four in a row horizontally, vertically, or diagonally to win!",
    shortDescription: "Drop discs, connect four to win",
    accentColor: "#EF4444",
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: "2–5 min",
    category: "strategy",
    rules: [
      "Players take turns dropping a disc into one of the 7 columns",
      "Discs fall to the lowest available position in the chosen column",
      "First player to connect 4 discs in a row (horizontal, vertical, or diagonal) wins",
      "If all 42 cells are filled with no winner, the game is a draw",
      "Red always goes first",
    ],
    tags: ["classic", "strategy", "two-player", "grid"],
  },
  "battleship": {
    id: "battleship",
    name: "Battleship",
    emoji: "🚢",
    description:
      "The classic naval combat game. Place your fleet on a hidden grid, then take turns firing at your opponent's waters. Sink all 5 enemy ships before they sink yours!",
    shortDescription: "Sink the enemy fleet",
    accentColor: "#0EA5E9",
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: "5–15 min",
    category: "strategy",
    rules: [
      "Each player secretly places 5 ships on their 10×10 grid: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)",
      "Ships can be placed horizontally or vertically, but cannot overlap",
      "Players take turns firing at a cell on their opponent's grid",
      "A hit is marked with fire 🔥, a miss with a dot",
      "When all cells of a ship are hit, it is sunk",
      "The first player to sink all 5 enemy ships wins!",
    ],
    tags: ["classic", "strategy", "two-player", "hidden-info", "naval"],
  },
  "word-scramble": {
    id: "word-scramble",
    name: "Word Scramble",
    emoji: "🔤",
    description:
      "Race to unscramble words before your friends! Choose from themed categories like Animals, Food, or Countries. First to figure out the scrambled word scores a point. Supports 2–8 players!",
    shortDescription: "Unscramble words faster than your friends",
    accentColor: "#8B5CF6",
    minPlayers: 2,
    maxPlayers: 8,
    estimatedDuration: "3–5 min",
    category: "party",
    rules: [
      "A scrambled word is shown to all players at the same time",
      "Type your guess and press Enter — unlimited attempts, no penalty",
      "The first player to type the correct word scores a point",
      "Each round has a 30-second time limit",
      "Choose from themed categories: Animals, Food, Countries, Sports, Science, Entertainment",
      "Play fixed rounds (5, 10, or 15) or first to a target score (3, 5, or 10)",
    ],
    tags: ["party", "word", "multiplayer", "fast-paced"],
  },
};

type Props = {
  params: Promise<{ gameId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const game = gameData[gameId];
  if (!game) return { title: "Game Not Found" };

  return {
    title: game.name,
    description: game.description,
    openGraph: {
      title: `${game.name} — Play Free Online | ArcadeKit`,
      description: game.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.name} — Play Free Online`,
      description: game.description,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(gameData).map((gameId) => ({ gameId }));
}

export default async function GameDetailPage({ params }: Props) {
  const { gameId } = await params;
  const game = gameData[gameId];

  if (!game) {
    notFound();
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/games"
          className="mb-6 inline-flex items-center text-sm text-text-secondary hover:text-foreground"
        >
          ← All Games
        </Link>

        {/* Game Header */}
        <div className="text-center">
          <span className="text-5xl">{game.emoji}</span>
          <h1 className="mt-4 font-heading text-3xl font-bold md:text-4xl">
            {game.name}
          </h1>
          <p className="mt-3 text-text-secondary">{game.description}</p>

          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers} players`
                : `${game.minPlayers}-${game.maxPlayers} players`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {game.estimatedDuration}
            </span>
          </div>
        </div>

        {/* Create Room CTA */}
        <div className="mt-8 flex justify-center">
          <CreateRoomButton gameId={game.id} accentColor={game.accentColor} />
        </div>

        {/* Rules */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold">How to Play</h2>
          <ul className="mt-4 space-y-3">
            {game.rules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-secondary">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-text-muted">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
