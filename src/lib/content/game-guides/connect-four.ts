// ============================================================
// ArcadeKit — How to Play Guide: Connect Four
// ============================================================

import type { GameGuide } from "./types";

export const connectFourGuide: GameGuide = {
  gameId: "connect-four",
  gameName: "Connect Four",
  emoji: "🔴",
  accentColor: "#EF4444",

  metaTitle: "How to Play Connect Four: Rules, Winning Strategy & the Solved-Game Secret",
  metaDescription:
    "Master Connect Four: complete rules, why the center column wins games, how to build double threats, odd-even threat theory, and the 1988 discovery that solved the game.",
  keywords: [
    "how to play connect four",
    "connect four rules",
    "connect four strategy",
    "connect four best first move",
    "is connect four solved",
    "connect 4 tips and tricks",
  ],

  updated: "2026-07-14",
  heroTagline: "Gravity-powered strategy — four in a row wins, but the center column rules everything.",
  totalTimeMinutes: 5,

  intro: [
    "Connect Four is tic tac toe's bigger, smarter sibling. Two players take turns dropping colored discs into a vertical 7×6 grid, and gravity does the rest — each disc falls to the lowest open slot in its column. First to line up four discs horizontally, vertically, or diagonally wins.",
    "The vertical board changes everything. Because discs stack, you cannot simply claim any square you want — every move opens up the square above it, and that single rule creates traps, forced sequences, and long-term plans that tic tac toe could never support. It is easy enough for a six-year-old, yet mathematicians studied it seriously enough to solve it completely.",
  ],

  history: [
    "Connect Four as we know it was published by Milton Bradley in 1974, with its iconic upright blue frame and red and yellow discs. Persistent legend claims sailors played a version called “Captain's Mistress” aboard Captain Cook's ships in the 1700s — a great story, though historians have found no real evidence for it. Vertical four-in-a-row games certainly circulated before 1974, but it was the plastic Milton Bradley version that made the game a household name.",
    "Connect Four earned a place in computer science history in 1988, when Victor Allis and James Dow Allen independently solved the game within weeks of each other. The verdict: with perfect play, the first player always wins — but only by starting in the center column. Open in either column beside the center and perfect play ends in a draw; open in any of the four outer columns and a perfect opponent will beat you. Roughly 4.5 trillion board positions were ultimately mapped to prove it.",
  ],

  rules: {
    intro:
      "Setup takes ten seconds and the rules fit on a napkin — the depth all comes from gravity:",
    steps: [
      {
        name: "Set up the grid",
        text: "The board is 7 columns wide and 6 rows tall, standing vertically. Each player takes one color. Red traditionally moves first — alternate first move between games, because moving first is a real advantage.",
      },
      {
        name: "Drop discs on your turn",
        text: "On your turn, choose any column that is not full and drop one disc into it. The disc falls to the lowest empty slot in that column. You cannot skip a turn, and you cannot place a disc anywhere except the bottom of a column's stack.",
      },
      {
        name: "Connect four to win",
        text: "The first player to get four of their discs in a straight line wins immediately. Lines can be horizontal, vertical, or diagonal in either direction.",
      },
      {
        name: "Watch what your move enables",
        text: "This is the rule-that-isn't-a-rule: every disc you drop creates a new landing spot directly above it. Handing your opponent a winning square this way is the most common losing mistake in the game.",
      },
      {
        name: "Draw on a full board",
        text: "If all 42 slots fill with no four-in-a-row, the game is a draw. Draws are rare in casual play — someone almost always cracks first.",
      },
    ],
  },

  strategy: {
    intro:
      "Connect Four strategy has real theory behind it. These principles, roughly in order of importance, will beat most casual players:",
    tips: [
      {
        name: "Claim the center column",
        text: "The center column is part of more potential four-in-a-rows than any other — its middle squares each sit on 13 of the board's 69 winning lines, more than any other cell. Perfect play starts there, and if your opponent opens center, playing on top of their disc is a solid reply. When in doubt, play central.",
      },
      {
        name: "Build double threats",
        text: "A single three-in-a-row gets blocked every time. Winning positions come from creating two winning squares at once — most classically the horizontal “7” trap, where an open-ended three on the bottom row threatens both ends. Your opponent blocks one; you win in the other.",
      },
      {
        name: "Think one row up",
        text: "Before dropping a disc, always check the square directly above where it will land. If that square completes a four for your opponent, you have just lost the game with your own move. This single habit eliminates the majority of casual-play defeats.",
      },
      {
        name: "Learn odd and even threats",
        text: "The deepest idea in Connect Four: a “threat” is a square that would complete your four, and what matters is its row parity. If the board fills up column by column, the first player naturally lands on odd rows (1, 3, 5 from the bottom) and the second player on even rows. So as the first player, engineer threats on odd rows; as the second player, on even rows. This is what decides games between strong players — the endgame plays itself out by parity.",
      },
      {
        name: "Stack threats vertically",
        text: "Two of your threats in the same column, one above the other, are devastating: if your opponent blocks the lower one, their own disc lifts you into the upper one. Meanwhile, avoid letting your threats sit uselessly above your opponent's threats in the same column.",
      },
    ],
  },

  variations: {
    intro:
      "The official game has spawned several worthwhile twists, and the concept scales to bigger formats beautifully:",
    items: [
      {
        name: "Pop Out",
        text: "On your turn, instead of dropping a disc you may remove one of your own discs from the bottom row, dropping everything above it down one slot. Removals can complete a four for either player, which makes for wild finishes.",
      },
      {
        name: "Five in a Row on a bigger board",
        text: "Widening the board to 9 or 10 columns and requiring five in a row slows the game down and rewards even longer plans. A good next step when standard games start feeling scripted.",
      },
      {
        name: "Cylinder rules",
        text: "The board wraps around — lines can continue from the rightmost column to the leftmost. Suddenly edge columns are as strong as the center, and all your instincts need recalibrating.",
      },
      {
        name: "Scoring variant",
        text: "Play the full 42 discs regardless of connections, scoring one point for every four-in-a-row formed (overlaps count). Turns a sudden-death game into a positional accumulation battle.",
      },
    ],
  },

  faq: [
    {
      question: "Is Connect Four solved?",
      answer:
        "Yes — solved independently by Victor Allis and James Dow Allen in 1988. With perfect play, the first player wins by opening in the center column. Opening in the columns beside the center leads to a draw with perfect play, and opening in the four outer columns actually loses. In practice no human plays perfectly, so the game remains very much alive.",
    },
    {
      question: "What is the best first move in Connect Four?",
      answer:
        "The center column, unambiguously. It joins the most winning lines and is the only opening that forces a win with perfect play. If you are second and center is taken, playing center on top of them is a sound reply.",
    },
    {
      question: "Can the second player win at Connect Four?",
      answer:
        "Only if the first player makes a mistake — but they nearly always do. As the second player, prioritize even-row threats (rows 2, 4, 6 from the bottom), keep the position closed, and punish any move that hands you a square you needed.",
    },
    {
      question: "How is Connect Four different from tic tac toe?",
      answer:
        "Gravity. In tic tac toe you can take any open square, so threats are immediate and the game is shallow. In Connect Four you can only reach a square when the column beneath it is filled, which creates timing, parity, and traps planned many moves ahead. It is the natural next game once tic tac toe always draws.",
    },
    {
      question: "How long does a Connect Four game take?",
      answer:
        "Casual games run two to five minutes. Between deliberate players a single game can stretch to fifteen — the 42-move ceiling keeps even the longest games snappy compared to chess or checkers.",
    },
    {
      question: "How many possible Connect Four positions are there?",
      answer:
        "About 4.5 trillion (4,531,985,219,092 to be exact) legal board positions. Big enough to feel infinite across a lifetime of play; small enough that computers have mapped every one.",
    },
  ],

  gear: {
    intro:
      "The physical game remains a classic gift and coffee-table fixture — a few formats worth considering:",
    items: [
      {
        name: "Classic Connect 4 by Hasbro",
        blurb:
          "The standard blue-frame version with red and yellow discs. Sturdy, cheap, and the satisfying disc-drop clack never gets old.",
        searchQuery: "connect 4 classic grid board game",
      },
      {
        name: "Giant four-in-a-row set",
        blurb:
          "Wooden yard-scale versions stand two to four feet tall — a staple at barbecues, breweries, and backyard parties.",
        searchQuery: "giant connect four outdoor wooden game",
      },
    ],
  },
};
