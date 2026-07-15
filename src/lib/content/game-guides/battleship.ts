// ============================================================
// ArcadeKit — How to Play Guide: Battleship
// ============================================================

import type { GameGuide } from "./types";

export const battleshipGuide: GameGuide = {
  gameId: "battleship",
  gameName: "Battleship",
  emoji: "🚢",
  accentColor: "#0EA5E9",

  metaTitle: "How to Play Battleship: Rules, Setup, Strategy & Probability Hunting",
  metaDescription:
    "The complete Battleship guide: official rules and ship sizes, smart fleet placement, the hunt-and-target method, parity searching, and variations like Salvo — plus free printable grids.",
  keywords: [
    "how to play battleship",
    "battleship rules",
    "battleship strategy",
    "battleship ship sizes",
    "best battleship placement",
    "battleship game how many ships",
  ],

  updated: "2026-07-14",
  heroTagline: "Hidden fleets, called shots, and cold deduction — the classic game of naval combat.",
  totalTimeMinutes: 15,

  intro: [
    "Battleship is the definitive hidden-information game. Each player secretly arranges a fleet of five ships on a 10×10 grid, then the players take turns calling out coordinates, trying to find and sink each other's fleet. You can see every shot you have taken — but never your opponent's board.",
    "That hidden board is what makes Battleship special. There is no lucky dice roll to blame: every game is a pure contest of search strategy, probability, and reading how your opponent thinks. Casual players fire at random; good players run a system. By the end of this guide, you will have the system.",
  ],

  history: [
    "Battleship began as a pencil-and-paper game played by French and Russian soldiers around World War I. Players drew their own grids, hid their fleets, and called shots exactly as we do today. Printed pad-and-pencil versions appeared commercially in the 1930s, including Milton Bradley's “Broadsides, the Game of Naval Strategy.”",
    "The version everyone recognizes — plastic cases, peg boards, little grey ships — arrived when Milton Bradley reissued the game as Battleship in 1967. The upright two-sided case was a genuine design breakthrough: it hid your fleet, organized your shot tracking, and made the game portable. Electronic talking versions followed in the late 1970s (Electronic Battleship was among the first mainstream games with a computer opponent), and the formula has barely needed to change since.",
  ],

  rules: {
    intro:
      "Standard rules use a 10×10 grid with rows lettered A–J and columns numbered 1–10, so every square has a call sign like “B7”. Here is the full game:",
    steps: [
      {
        name: "Set up your fleet",
        text: "Each player secretly places five ships on their own grid: Carrier (5 squares), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2). Ships are placed horizontally or vertically — never diagonally — and cannot overlap or hang off the grid.",
      },
      {
        name: "Agree on the touching rule",
        text: "Under classic Milton Bradley rules, ships may sit directly beside each other. Many players use the house rule that ships must keep a one-square gap — it makes deduction cleaner. Agree before you start; ArcadeKit's printable board generator uses the one-square-gap convention.",
      },
      {
        name: "Take turns calling shots",
        text: "On your turn, call one coordinate — say, “E5.” Your opponent must answer truthfully: “hit” if a ship occupies that square, otherwise “miss.” Mark every result on your tracking grid: hits and misses are your only map of their waters.",
      },
      {
        name: "Announce sunk ships",
        text: "When the last square of a ship is hit, its owner must announce which ship was sunk — “You sank my Cruiser.” This is vital information: it tells the attacker exactly which ship sizes remain afloat.",
      },
      {
        name: "Sink the fleet to win",
        text: "The first player to sink all five enemy ships wins. If you are playing with simultaneous turns (both players call a shot each round), a mutual final sinking is a draw — but standard alternating turns always produce a winner.",
      },
    ],
  },

  strategy: {
    intro:
      "Battleship strategy splits cleanly into two problems: where to put your ships, and how to find theirs. The search side has real math behind it — this is the hunt-and-target system used by every strong player:",
    tips: [
      {
        name: "Run two modes: Hunt and Target",
        text: "In Hunt mode you are searching for any hit. The moment you score one, switch to Target mode: probe the four adjacent squares to find the ship's direction, then follow the line until it sinks. When it is down, return to Hunt mode. Never keep wandering after scoring an unresolved hit — finish what you found.",
      },
      {
        name: "Hunt on parity",
        text: "The smallest ship is two squares long, so every ship must cover at least one square of a checkerboard pattern. Hunting only on “every other square” — like the black squares of a chessboard — halves your search space at zero cost. Once your opponent's Destroyer is sunk, the smallest remaining ship is three long, and you can thin your search pattern to every third square.",
      },
      {
        name: "Weight the center",
        text: "There are more ways to place a ship through central squares than corner squares — a Carrier has only one way to touch A1 horizontally, but ten ways to pass through the middle of a row. When choosing between parity squares, prefer central ones. Corners are statistically the coldest squares on the board.",
      },
      {
        name: "Place your fleet against the odds",
        text: "Everything that makes center shots good for attackers makes edges better for defenders — but only in moderation. Sprinkling some ships near (not in) the edges, avoiding neat rows, and never clustering your fleet denies attackers the pattern they are counting on. Above all, avoid placements that feel “tidy” — humans hunt for symmetry first.",
      },
      {
        name: "Track what is left",
        text: "Count sunk ships and update what you are looking for. If only the Carrier remains, any gap of four or fewer squares between your misses cannot hold it — whole regions of the board become dead and your effective search area collapses. The endgame belongs to whoever does this bookkeeping.",
      },
    ],
  },

  variations: {
    intro:
      "Battleship's simple call-and-answer core supports a surprising number of formats:",
    items: [
      {
        name: "Salvo",
        text: "The classic advanced variant: each turn you fire one shot per ship you still have afloat, calling all shots before your opponent answers any of them. Losing ships now weakens your offense too, and the endgame becomes a desperate race. Strongly recommended once basic games feel slow.",
      },
      {
        name: "Pencil and paper",
        text: "The original format needs nothing but two grids per player — one for your fleet, one for tracking shots. Print free ready-made grids with ArcadeKit's Battleship Board generator and play anywhere.",
      },
      {
        name: "Alternative fleets",
        text: "House fleets change the search math: swap the Carrier for two extra Destroyers for a nervy hunt of small targets, or play “convoy” rules where one hidden ship must survive rather than the whole fleet.",
      },
      {
        name: "2v2 teams",
        text: "Two players per side, one board per team: partners alternate calling shots and can split duties — one runs the parity hunt while the other manages target-mode kills. Great party format.",
      },
    ],
  },

  faq: [
    {
      question: "How many ships are in Battleship, and what sizes?",
      answer:
        "The standard modern fleet is five ships: Carrier (5 squares), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2) — 17 occupied squares in total on a 10×10 grid. Later editions renamed some ships (the Cruiser became the Destroyer, and the old Destroyer became the Patrol Boat), and pencil-and-paper traditions in other countries use different fleets entirely — which is why family memories of the lineup often differ.",
    },
    {
      question: "Can ships touch each other in Battleship?",
      answer:
        "Under official Hasbro/Milton Bradley rules, yes — ships may be placed side by side. The popular house rule requiring a one-square gap between ships (used across much of Europe and in ArcadeKit's board generator) makes deduction sharper: sinking a ship then tells you its whole perimeter is empty. Just agree before placing.",
    },
    {
      question: "Do you have to announce which ship was sunk in Battleship?",
      answer:
        "Yes. Standard rules require announcing the ship by name when it goes down. It matters strategically — knowing the Destroyer is gone lets your opponent widen their search pattern, so forgetting (or “forgetting”) changes the game meaningfully.",
    },
    {
      question: "What is the best way to place ships in Battleship?",
      answer:
        "There is no unbeatable placement, but there are losing habits: fleets clustered together die in chains, perfectly symmetric layouts get read quickly, and all-center placements walk into probability-guided fire. Mix orientations, lean slightly toward the edges, and place each ship as if the others did not exist.",
    },
    {
      question: "What is the fastest possible win in Battleship?",
      answer:
        "Seventeen shots — every call a hit, sinking all five ships without a single miss. In practice, pure random firing needs roughly 96 shots on average to finish a board, a disciplined hunt-and-target system drops that to around 65, adding parity pushes near 60, and full probability-weighted targeting averages about 50. The system really is worth almost two-to-one.",
    },
    {
      question: "Can you play Battleship on paper?",
      answer:
        "Absolutely — that is how the game started. Each player needs two 10×10 grids: one to place their fleet, one to track shots. ArcadeKit's free Battleship Board tool prints exactly that layout, two clean pages, one per player.",
    },
  ],

  gear: {
    intro:
      "If you want the tactile version — pegs, plastic seas, and the drama of the upright case:",
    items: [
      {
        name: "Hasbro Battleship — classic edition",
        blurb:
          "The standard two-case set with peg boards and the full five-ship fleet. Still the definitive way to play at a table.",
        searchQuery: "hasbro battleship classic board game",
      },
      {
        name: "Travel Battleship",
        blurb:
          "Compact clamshell versions with snap-in pegs survive backpacks and airplane tray tables remarkably well.",
        searchQuery: "travel battleship game portable",
      },
    ],
  },

  relatedTool: {
    slug: "battleship-board",
    name: "Battleship Board Generator",
    blurb:
      "Generate a random fleet placement or print blank 10×10 grids — two ready-to-play pages, one per player — for classic pencil-and-paper Battleship.",
  },
};
