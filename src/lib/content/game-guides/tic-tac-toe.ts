// ============================================================
// ArcadeKit — How to Play Guide: Tic Tac Toe
// ============================================================

import type { GameGuide } from "./types";

export const ticTacToeGuide: GameGuide = {
  gameId: "tic-tac-toe",
  gameName: "Tic Tac Toe",
  emoji: "❌",
  accentColor: "#3B82F6",

  metaTitle: "How to Play Tic Tac Toe: Rules, Strategy & Why It Always Ends in a Draw",
  metaDescription:
    "Learn tic tac toe rules in 30 seconds, then go deeper: opening strategy, how to set up forks, why perfect play always draws, and fun variations to keep it fresh.",
  keywords: [
    "how to play tic tac toe",
    "tic tac toe rules",
    "tic tac toe strategy",
    "tic tac toe best first move",
    "can you always win tic tac toe",
    "noughts and crosses rules",
  ],

  updated: "2026-07-14",
  heroTagline: "The three-in-a-row classic — simple to learn, surprisingly deep to master.",
  totalTimeMinutes: 2,

  intro: [
    "Tic tac toe (or noughts and crosses, if you grew up in the UK) is the first strategy game most of us ever learn — and that is exactly what makes it worth understanding properly. Two players take turns marking a 3×3 grid, one playing X and one playing O, racing to line up three marks in a row.",
    "Here is the fascinating part: tic tac toe is a solved game. If both players play perfectly, every single game ends in a draw. That means every win you have ever scored came from your opponent making a mistake — and once you know the handful of patterns below, you will be the one forcing those mistakes instead of making them.",
  ],

  history: [
    "Three-in-a-row games are genuinely ancient. Archaeologists have found grid patterns scratched into roofing tiles in ancient Egypt, and the Romans played a close cousin called terni lapilli — “three pebbles at a time” — leaving boards carved into stone all over the empire.",
    "The modern pencil-and-paper version took off in Britain in the 19th century under the name noughts and crosses, and the American name “tick-tack-toe” settled into its current spelling in the 20th. The game also earned a quiet place in computing history: in 1952, a tic tac toe program called OXO written for the EDSAC computer at Cambridge became one of the earliest video games ever created, and in 1961 researcher Donald Michie built MENACE, a machine that learned to play tic tac toe using 304 matchboxes full of colored beads — one of the first demonstrations of machine learning.",
  ],

  rules: {
    intro:
      "You can teach tic tac toe in under a minute. Here is the complete game, step by step:",
    steps: [
      {
        name: "Set up the board",
        text: "Start with an empty 3×3 grid. Decide who plays X and who plays O — X always moves first, which is a real advantage, so alternate who takes X between games.",
      },
      {
        name: "Take turns placing marks",
        text: "On your turn, place your mark in any empty square. Once placed, marks never move — there is no capturing or swapping.",
      },
      {
        name: "Race to three in a row",
        text: "The first player to get three of their marks in a straight line wins. The line can run horizontally, vertically, or diagonally — all eight lines count.",
      },
      {
        name: "Call the draw",
        text: "If all nine squares fill up and nobody has three in a row, the game is a draw — called a “cat's game.” Between good players, this is the most common result by far.",
      },
      {
        name: "Rematch fairly",
        text: "Because X has the first-move advantage, the standard etiquette is to swap marks every game, or let the loser of the previous round go first.",
      },
    ],
  },

  strategy: {
    intro:
      "Tic tac toe strategy comes down to one idea: create two threats at once — a “fork” — so your opponent can only block one of them. Everything below serves that goal.",
    tips: [
      {
        name: "Take the center if you can",
        text: "The center square is part of four winning lines — more than any other square. If you move first, center and corner are both strong openings; if your opponent opens in a corner, taking the center is essentially mandatory to avoid losing.",
      },
      {
        name: "Prefer corners over edges",
        text: "Each corner sits on three winning lines, while edge squares (the middles of each side) sit on only two. Most forks are built from corners — a common winning pattern is taking two opposite corners while your opponent holds only the center.",
      },
      {
        name: "Block first, build second",
        text: "Before making any move, scan the board: does your opponent have two in a row with an open third square? If yes, you must block it — no exceptions. Missing a block is how nearly every game of tic tac toe is lost.",
      },
      {
        name: "Build forks, not single threats",
        text: "A single two-in-a-row gets blocked every time. Instead, look for moves that create two lines of two simultaneously. Your opponent can only block one, and the game is yours.",
      },
      {
        name: "Break forks before they form",
        text: "Defensively, the same logic applies in reverse. If your opponent could fork you next turn, either block the fork square directly or make a two-in-a-row threat of your own that forces them to respond elsewhere.",
      },
    ],
  },

  variations: {
    intro:
      "Once basic tic tac toe starts ending in draws every time, these variations bring the challenge back:",
    items: [
      {
        name: "Best-of series",
        text: "The simplest fix: play best-of-five or best-of-seven, alternating who goes first. Momentum and fatigue make it more interesting than a single round.",
      },
      {
        name: "Ultimate tic tac toe",
        text: "Nine tic tac toe boards arranged in a 3×3 super-grid. Your move within a small board decides which board your opponent must play in next. Genuinely deep — games take 10–20 minutes and reward long-term planning.",
      },
      {
        name: "Misère (reverse) rules",
        text: "Three in a row loses. This flips your instincts completely and is harder than it sounds — the first player must avoid the center to survive.",
      },
      {
        name: "Wild tic tac toe",
        text: "On your turn, place either an X or an O — your choice each move. The first player to complete any three-in-a-row of the same symbol wins. Chaotic and fun.",
      },
      {
        name: "Bigger boards",
        text: "On a 4×4 or 5×5 grid (needing four or five in a row), the game stops being solved-in-your-head and starts resembling gomoku, a serious strategy game in its own right.",
      },
    ],
  },

  faq: [
    {
      question: "Can you always win at tic tac toe?",
      answer:
        "No. Tic tac toe is a solved game, and with perfect play from both sides it always ends in a draw. You can only win if your opponent makes a mistake — good strategy is about creating the situations where mistakes are most likely.",
    },
    {
      question: "Does going first matter in tic tac toe?",
      answer:
        "Yes, meaningfully. X gets five of the nine squares and always has more chances to build a fork. X cannot force a win against perfect defense, but in casual play the first player wins far more often. That is why players traditionally alternate who goes first.",
    },
    {
      question: "What is the best first move in tic tac toe?",
      answer:
        "The center is the safest strong opening — it joins four winning lines. A corner opening is at least as dangerous in practice, because the natural-looking replies to it lose: if your opponent answers a corner with anything other than the center, you can force a fork.",
    },
    {
      question: "Why is a tic tac toe draw called a “cat's game”?",
      answer:
        "The origin is murky, but the most common explanation is that a cat chasing its own tail gets nothing for its effort — just like two players filling the board with no winner.",
    },
    {
      question: "Is tic tac toe good for kids?",
      answer:
        "Excellent, around ages 4–6 and up. It teaches turn-taking, pattern recognition, and thinking one move ahead — and it is short enough that losing never stings for long. Once a child starts forcing draws consistently, they are ready for Connect Four.",
    },
    {
      question: "How many possible games of tic tac toe are there?",
      answer:
        "There are 255,168 possible game sequences, but only 138 genuinely distinct final board positions once you account for rotations and reflections. It is a small enough game that computers — and dedicated humans — can know it completely.",
    },
  ],

  gear: {
    intro:
      "Tic tac toe needs nothing but paper, but a physical set makes a nice fidget-friendly fixture for a coffee table or classroom:",
    items: [
      {
        name: "Wooden tic tac toe board",
        blurb:
          "A chunky wooden set with carved X and O pieces — the kind that lives on a coffee table and gets played daily.",
        searchQuery: "wooden tic tac toe board game set",
      },
      {
        name: "Giant outdoor tic tac toe",
        blurb:
          "Lawn-sized versions with bean bags or big wooden pieces turn the world's fastest game into a backyard party fixture.",
        searchQuery: "giant outdoor tic tac toe game",
      },
    ],
  },
};
