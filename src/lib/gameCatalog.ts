// ============================================================
// ArcadeKit — Game Catalog (server-safe)
// Single source of display data for every game, importable from
// server components (the client registry can't be, since it holds
// React components). Add a new game here once and the home, games,
// detail, and about pages plus the sitemap all pick it up.
// ============================================================

export interface CatalogGame {
  id: string;
  emoji: string;
  name: string;
  /** One-line teaser for cards */
  shortDescription: string;
  /** Full description for the detail page and metadata */
  description: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  /** Display string, e.g. "2–8 players" */
  players: string;
  /** Display string, e.g. "~2 min" */
  duration: string;
  accentColor: string;
  tags: string[];
  rules: string[];
}

export const gameCatalog: CatalogGame[] = [
  {
    id: "rule-out",
    emoji: "🕵️",
    name: "Rule Out",
    shortDescription: "Find the hidden face with yes-or-no questions",
    description:
      "A face-guessing game for two. You each get a secret card from the same board of 24 faces. Ask yes-or-no questions, rule out the faces that don't fit, and make one final guess. Guess right and you win; guess wrong and you lose.",
    category: "strategy",
    minPlayers: 2,
    maxPlayers: 2,
    players: "2 players",
    duration: "~10 min",
    accentColor: "#14B8A6",
    tags: ["two-player", "deduction", "hidden-info", "faces"],
    rules: [
      "Each player gets a secret card from the same board of 24 faces",
      "Ask yes-or-no questions about your opponent's card, either out loud or by taking turns in the app",
      "Tap the faces that don't fit the answers to rule them out",
      "When you think you know their card, make your final guess",
      "Guess right and you win. Guess wrong and you lose",
      "In turn mode, asking a question uses your turn, and you can only guess on your turn",
    ],
  },
  {
    id: "tic-tac-toe",
    emoji: "❌",
    name: "Tic Tac Toe",
    shortDescription: "Classic strategy — get three in a row to win",
    description:
      "The classic strategy game. Take turns placing X's and O's on a 3×3 grid. First to get three in a row wins!",
    category: "strategy",
    minPlayers: 2,
    maxPlayers: 2,
    players: "2 players",
    duration: "~2 min",
    accentColor: "#3B82F6",
    tags: ["classic", "strategy", "two-player"],
    rules: [
      "Players take turns placing their mark (X or O) on the board",
      "First player to get 3 marks in a row (horizontal, vertical, or diagonal) wins",
      "If all 9 squares are filled with no winner, it's a draw",
    ],
  },
  {
    id: "rock-paper-scissors",
    emoji: "✊",
    name: "Rock Paper Scissors",
    shortDescription: "Best of 3 showdown — outsmart your opponent",
    description:
      "The ultimate showdown of wits. Choose rock, paper, or scissors simultaneously. Best of 3 rounds wins the match!",
    category: "quick",
    minPlayers: 2,
    maxPlayers: 2,
    players: "2 players",
    duration: "~2 min",
    accentColor: "#F97316",
    tags: ["classic", "quick", "two-player"],
    rules: [
      "Both players choose rock, paper, or scissors simultaneously",
      "Rock beats scissors, scissors beats paper, paper beats rock",
      "First player to win 2 rounds wins the match",
    ],
  },
  {
    id: "connect-four",
    emoji: "🔴",
    name: "Connect Four",
    shortDescription: "Drop discs, connect four to win",
    description:
      "The classic disc-dropping strategy game. Take turns dropping colored discs into a 7-column grid — connect four in a row horizontally, vertically, or diagonally to win!",
    category: "strategy",
    minPlayers: 2,
    maxPlayers: 2,
    players: "2 players",
    duration: "2–5 min",
    accentColor: "#EF4444",
    tags: ["classic", "strategy", "two-player", "grid"],
    rules: [
      "Players take turns dropping a disc into one of the 7 columns",
      "Discs fall to the lowest available position in the chosen column",
      "First player to connect 4 discs in a row (horizontal, vertical, or diagonal) wins",
      "If all 42 cells are filled with no winner, the game is a draw",
      "Red always goes first",
    ],
  },
  {
    id: "battleship",
    emoji: "🚢",
    name: "Battleship",
    shortDescription: "Sink the enemy fleet",
    description:
      "The classic naval combat game. Place your fleet on a hidden grid, then take turns firing at your opponent's waters. Sink all 5 enemy ships before they sink yours!",
    category: "strategy",
    minPlayers: 2,
    maxPlayers: 2,
    players: "2 players",
    duration: "5–15 min",
    accentColor: "#0EA5E9",
    tags: ["classic", "strategy", "two-player", "hidden-info", "naval"],
    rules: [
      "Each player secretly places 5 ships on their 10×10 grid: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)",
      "Ships can be placed horizontally or vertically, but cannot overlap",
      "Players take turns firing at a cell on their opponent's grid",
      "A hit is marked with fire 🔥, a miss with a dot",
      "When all cells of a ship are hit, it is sunk",
      "The first player to sink all 5 enemy ships wins!",
    ],
  },
  {
    id: "word-scramble",
    emoji: "🔤",
    name: "Word Scramble",
    shortDescription: "Unscramble words faster than your friends",
    description:
      "Race to unscramble words before your friends! Choose from themed categories like Animals, Food, or Countries. First to figure out the scrambled word scores a point. Supports 2–8 players!",
    category: "party",
    minPlayers: 2,
    maxPlayers: 8,
    players: "2–8 players",
    duration: "3–5 min",
    accentColor: "#8B5CF6",
    tags: ["party", "word", "multiplayer", "fast-paced"],
    rules: [
      "A scrambled word is shown to all players at the same time",
      "Type your guess and press Enter — unlimited attempts, no penalty",
      "The first player to type the correct word scores a point",
      "Each round has a 30-second time limit",
      "Choose from themed categories: Animals, Food, Countries, Sports, Science, Entertainment",
      "Play fixed rounds (5, 10, or 15) or first to a target score (3, 5, or 10)",
    ],
  },
  {
    id: "reaction-race",
    emoji: "⚡",
    name: "Reaction Race",
    shortDescription: "Test your reflexes against your friends",
    description:
      "A fast-paced reaction time game. Wait for the screen to turn green, then click as fast as you can! Fastest reaction wins the round. But click too early and you get a false start! Supports 2–8 players.",
    category: "party",
    minPlayers: 2,
    maxPlayers: 8,
    players: "2–8 players",
    duration: "2–3 min",
    accentColor: "#22C55E",
    tags: ["party", "reflex", "multiplayer", "fast-paced"],
    rules: [
      "Wait for the screen to turn green before clicking",
      "Click or press Space as fast as you can when you see 'GO!'",
      "Fastest reaction time wins the round and scores a point",
      "Clicking before the green signal is a false start — you miss that round",
      "Play fixed rounds or first to a target score",
    ],
  },
  {
    id: "hangman",
    emoji: "🪢",
    name: "Hangman",
    shortDescription: "Guess letters, dodge the gallows, solve the word",
    description:
      "The classic word-guessing game, multiplayer. Take turns guessing letters on a shared gallows — score for every letter you reveal, risk a full-word solve for big points, and don't let the hangman finish! Supports 2–8 players.",
    category: "word",
    minPlayers: 2,
    maxPlayers: 8,
    players: "2–8 players",
    duration: "5–10 min",
    accentColor: "#F59E0B",
    tags: ["classic", "word", "multiplayer", "turn-based"],
    rules: [
      "Everyone guesses the same hidden word — players take turns picking letters",
      "Correct letter: +10 points per appearance, and you keep your turn",
      "Wrong letter: a strike is added to the shared gallows and your turn passes",
      "On your turn you can try to solve the whole word: +20 points per hidden letter if right, a strike and your turn if wrong",
      "If the gallows fills up (6, 8, or 10 strikes), the round ends with no winner",
      "Most points after all rounds wins the match",
    ],
  },
];

/** Look up a single game by ID. */
export function getCatalogGame(id: string): CatalogGame | undefined {
  return gameCatalog.find((g) => g.id === id);
}
