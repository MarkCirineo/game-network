// ============================================================
// ArcadeKit — How to Play Guide: Word Scramble
// ============================================================

import type { GameGuide } from "./types";

export const wordScrambleGuide: GameGuide = {
  gameId: "word-scramble",
  gameName: "Word Scramble",
  emoji: "🔤",
  accentColor: "#8B5CF6",

  metaTitle: "How to Play Word Scramble: Rules, Unscrambling Tricks & Winning Faster",
  metaDescription:
    "Learn how to play multiplayer Word Scramble and actually win: proven unscrambling techniques, letter-pattern tricks, category tactics, and answers to common questions.",
  keywords: [
    "how to play word scramble",
    "word scramble rules",
    "how to unscramble words fast",
    "word scramble tips",
    "anagram game with friends",
    "multiplayer word game online",
  ],

  updated: "2026-07-14",
  heroTagline: "Everyone sees the same scrambled word — fastest brain wins.",
  totalTimeMinutes: 5,

  intro: [
    "Word Scramble is an anagram race. Every player sees the same scrambled word at the same moment — say, LEPHANTE — and the first person to type the answer (ELEPHANT) takes the point. Rounds are fast, the clock is short, and there is no penalty for wrong guesses, so the game rewards fearless rapid-fire thinking over careful deliberation.",
    "On ArcadeKit, Word Scramble supports two to eight players with themed categories like Animals, Food, Countries, Sports, Science, and Entertainment. The category is your biggest clue — and as you will see below, using it well is the difference between winning and watching someone else's name light up round after round.",
  ],

  history: [
    "Rearranging letters for sport is genuinely ancient — the Greeks played with anagrams over two thousand years ago, and medieval scholars hid names and prophecies inside them. By the Victorian era, anagram parlor games with letter cards were a fixture of drawing-room entertainment, and anagramming became a standard tool of crossword setters and puzzle columns.",
    "The modern scrambled-word format owes most to Jumble, the newspaper puzzle created by Martin Naydel in 1954, which still runs in hundreds of papers daily. Competitive unscrambling got its adrenaline from TV word games and later from online multiplayer versions, which added the ingredient print never could: a live race against other people. That real-time competition — everyone staring at the same letters, first correct answer wins — is the version you are playing here.",
  ],

  rules: {
    intro:
      "Word Scramble on ArcadeKit is built for speed. Here is the complete flow of a match:",
    steps: [
      {
        name: "Create a room and pick your settings",
        text: "The host chooses a word category (Animals, Food, Countries, Sports, Science, or Entertainment), then a match format: a fixed number of rounds (5, 10, or 15) or first-to-a-target-score (3, 5, or 10 points).",
      },
      {
        name: "Read the scrambled word",
        text: "Each round, one word from the category appears with its letters shuffled — every player sees the identical scramble at the identical moment. The scramble never accidentally spells the answer.",
      },
      {
        name: "Type and guess freely",
        text: "Type your guess and press Enter. Wrong guesses cost nothing — no penalties, no lockouts — so guess early and often. You are racing people, not the game.",
      },
      {
        name: "First correct answer scores",
        text: "The first player to submit the correct word wins the round and one point. Everyone immediately sees who scored and what the word was.",
      },
      {
        name: "Beat the clock",
        text: "Each round has a 30-second limit. If nobody solves the word in time, the answer is revealed and the round scores nothing.",
      },
      {
        name: "Win the match",
        text: "Play continues until the round count is exhausted or a player reaches the target score. Highest total wins; if the top scores are level when the rounds run out, the match is a draw.",
      },
    ],
  },

  strategy: {
    intro:
      "Unscrambling is a learnable skill with real technique behind it — competitive Scrabble and Boggle players train exactly these habits:",
    tips: [
      {
        name: "Lead with the category",
        text: "Before wrestling with letters, think in category space. Eight letters in the Animals category? Run the likely suspects — ELEPHANT, FLAMINGO, KANGAROO — against the letters you see. Confirming a guess is far faster than constructing one, and the category shrinks the candidate list from thousands of words to a few dozen.",
      },
      {
        name: "Find the skeleton first",
        text: "Separate vowels from consonants at a glance. English words alternate them in predictable rhythms, so knowing you have three vowels in a seven-letter word immediately suggests shapes like CVCVCVC. The vowel count alone frequently gives the word away within a category.",
      },
      {
        name: "Hunt common chunks",
        text: "Letters travel in packs: TH, CH, SH, QU at the front; -ING, -TION, -ER, -LY at the back. Spotting I-N-G in the scramble and mentally gluing it to the end leaves a much smaller puzzle. Double letters are an even bigger tell — few category words carry OO or LL, and they narrow things instantly.",
      },
      {
        name: "Rearrange, do not stare",
        text: "The scramble's letter order actively fights you — your brain keeps reading it as a pseudo-word. Break the spell by mentally regrouping letters into a new order (alphabetical works) or tracing them in a circle. Jumble solvers have used both tricks for seventy years because they work.",
      },
      {
        name: "Guess at 80% certain",
        text: "With no wrong-guess penalty, hesitation is pure loss. If a candidate fits the category and uses roughly the right letters, fire it off — typing a wrong guess costs two seconds, while waiting for certainty costs the round. The winner is usually the least perfectionist player.",
      },
    ],
  },

  variations: {
    intro:
      "The unscrambling race adapts to almost any setting — no screen required:",
    items: [
      {
        name: "Pen-and-paper scramble night",
        text: "One person plays host, scrambling ten themed words in advance. Players solve on paper against a timer; most solved wins. Works for classrooms, road trips, and family game nights.",
      },
      {
        name: "Themed decks",
        text: "Narrow the category to tonight's dinner theme, a friend's obsession, or your hometown — hand-picked word lists turn the game into an inside joke that plays.",
      },
      {
        name: "Kids' mode",
        text: "Use four- and five-letter words and drop the timer. Unscrambling is quietly excellent spelling practice — kids drill letter patterns without noticing they are learning.",
      },
      {
        name: "Marathon scoring",
        text: "Longer words score more: one point per letter rather than one per word. Suddenly the 30-second clock on a nine-letter monster is worth everyone's full attention.",
      },
    ],
  },

  faq: [
    {
      question: "What happens if two players answer at the same time in Word Scramble?",
      answer:
        "The server timestamps every submission and the first correct answer it receives wins the round — even when the gap is milliseconds. There are no ties within a round.",
    },
    {
      question: "Are wrong guesses penalized in Word Scramble?",
      answer:
        "No. Guess as often as you like — wrong answers simply do nothing. The design deliberately rewards fast, brave guessing over cautious certainty, which keeps rounds frantic.",
    },
    {
      question: "How are Word Scramble words chosen?",
      answer:
        "Each category draws from a curated word list — common enough to be solvable under pressure, varied enough that regulars keep seeing new words. The same word will not repeat within a match.",
    },
    {
      question: "How do I unscramble words faster?",
      answer:
        "Practice pattern recognition, not vocabulary. Drill common prefixes and suffixes, learn to count vowels at a glance, and always think category-first. A few evenings of play produce dramatic improvement — most of the skill is knowing where to look.",
    },
    {
      question: "Can more than two people play Word Scramble?",
      answer:
        "Yes — rooms hold up to eight players, and the game genuinely improves with a crowd. Everyone races the same word simultaneously, so there is no waiting for turns and no player elimination.",
    },
    {
      question: "Is Word Scramble good for kids?",
      answer:
        "Very. It is spelling and vocabulary practice disguised as a race. For mixed-age groups, pick friendlier categories like Animals or Food — and consider giving younger players a head-start handicap of a point or two.",
    },
  ],

  gear: {
    intro:
      "If letter-shuffling is your family's love language, these table games scratch the same itch:",
    items: [
      {
        name: "Bananagrams",
        blurb:
          "The beloved race-to-build-a-crossword game in a banana pouch — pure anagram speed with zero downtime, for one to eight players.",
        searchQuery: "bananagrams word game",
      },
      {
        name: "Boggle",
        blurb:
          "Shake the letter cube grid and race the sand timer to find words — the original everyone-plays-at-once word sprint.",
        searchQuery: "boggle word game classic",
      },
    ],
  },
};
