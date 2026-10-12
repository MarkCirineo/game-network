// ============================================================
// ArcadeKit — Game Catalog (server-safe)
// Display data for every game, importable from server components
// (the client registry can't be, since it holds React components).
// ============================================================

export interface CatalogGame {
  id: string;
  emoji: string;
  name: string;
  shortDescription: string;
  players: string;
  duration: string;
  accentColor: string;
}

export const gameCatalog: CatalogGame[] = [
  {
    id: "tic-tac-toe",
    emoji: "❌",
    name: "Tic Tac Toe",
    shortDescription: "Classic strategy — get three in a row to win",
    players: "2 players",
    duration: "~2 min",
    accentColor: "#3B82F6",
  },
  {
    id: "rock-paper-scissors",
    emoji: "✊",
    name: "Rock Paper Scissors",
    shortDescription: "Best of 3 showdown — outsmart your opponent",
    players: "2 players",
    duration: "~2 min",
    accentColor: "#F97316",
  },
  {
    id: "connect-four",
    emoji: "🔴",
    name: "Connect Four",
    shortDescription: "Drop discs, connect four to win",
    players: "2 players",
    duration: "2–5 min",
    accentColor: "#EF4444",
  },
  {
    id: "battleship",
    emoji: "🚢",
    name: "Battleship",
    shortDescription: "Sink the enemy fleet",
    players: "2 players",
    duration: "5–15 min",
    accentColor: "#0EA5E9",
  },
  {
    id: "word-scramble",
    emoji: "🔤",
    name: "Word Scramble",
    shortDescription: "Unscramble words faster than your friends",
    players: "2–8 players",
    duration: "3–5 min",
    accentColor: "#8B5CF6",
  },
  {
    id: "reaction-race",
    emoji: "⚡",
    name: "Reaction Race",
    shortDescription: "Test your reflexes against your friends",
    players: "2–8 players",
    duration: "2–3 min",
    accentColor: "#22C55E",
  },
  {
    id: "hangman",
    emoji: "🪢",
    name: "Hangman",
    shortDescription: "Guess letters, dodge the gallows, solve the word",
    players: "2–8 players",
    duration: "5–10 min",
    accentColor: "#F59E0B",
  },
];
