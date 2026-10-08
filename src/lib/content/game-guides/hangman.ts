// ============================================================
// ArcadeKit — How to Play Guide: Hangman
// ============================================================

import type { GameGuide } from "./types";

export const hangmanGuide: GameGuide = {
  gameId: "hangman",
  gameName: "Hangman",
  emoji: "🪢",
  accentColor: "#F59E0B",

  metaTitle: "How to Play Hangman: Rules, Best First Guesses & Winning Strategy",
  metaDescription:
    "Learn hangman rules and the strategy behind them: which letters to guess first, why 'jazz' is famously brutal, when to risk solving the word, and how multiplayer scoring works.",
  keywords: [
    "how to play hangman",
    "hangman rules",
    "hangman best letters to guess first",
    "hardest hangman words",
    "hangman online with friends",
    "multiplayer hangman game",
  ],

  updated: "2026-07-15",
  heroTagline: "One hidden word, one shared gallows — guess smart before the drawing is done.",
  totalTimeMinutes: 8,

  intro: [
    "Hangman is the word game everyone learns on the back of a school notebook: one hidden word, shown as a row of blanks, and a stick figure that grows one line at a time with every wrong letter. Guess the word before the drawing is finished, or the hangman wins.",
    "ArcadeKit's version turns the schoolyard duel into a competitive multiplayer race for 2–8 players. Everyone hunts the same word on a shared gallows, taking turns picking letters: correct guesses score points and let you keep guessing, wrong ones strike the gallows and pass the turn. And when you think you know the whole word, you can gamble on solving it outright for the biggest payout in the game. It is equal parts vocabulary, probability, and nerve.",
  ],

  history: [
    "Nobody knows exactly who invented hangman — letter-guessing games with a macabre scoring doodle were already Victorian parlor staples, and folklorist Alice Bertha Gomme recorded a version called “Birds, Beasts and Fishes” in her 1894 collection of traditional English games. The gallows drawing itself settled into its familiar form over the early 20th century, with regional variants counting anywhere from six strokes to more than a dozen.",
    "The format has proven remarkably durable. Wheel of Fortune — created by Merv Griffin in 1975 and still running — is essentially hangman with prizes, right down to contestants' famous fondness for the letters R, S, T, L, N, and E. And when home computers arrived in the late 1970s, hangman was one of the first games people typed into them: it needs nothing but a word list and a loop, which made it a staple of beginner programming books for decades. The game you are playing here is a direct descendant of both traditions.",
  ],

  rules: {
    intro:
      "ArcadeKit hangman is played in rounds, each with a fresh hidden word from your chosen theme. Here is the complete flow:",
    steps: [
      {
        name: "Set up the room",
        text: "The host picks a word theme (Animals, Food, Countries, Sports, Science, Entertainment, or Random), the number of rounds (3, 5, or 10), and the strike limit (6 for classic, 8 or 10 for more forgiving games). Two to eight players can join.",
      },
      {
        name: "Take turns picking letters",
        text: "Each round hides one word, shown as blank tiles. On your turn, guess any letter that has not been tried — tap it on the on-screen keyboard or press it on your physical keyboard. Everyone sees every guess.",
      },
      {
        name: "Correct letters score — and you keep your turn",
        text: "A correct letter earns 10 points for every time it appears in the word, and you keep guessing. Strong players chain several correct letters in a single turn.",
      },
      {
        name: "Wrong guesses strike the shared gallows",
        text: "A wrong letter adds one strike to the gallows — shared by everyone — and passes the turn to the next player. The letter is crossed out on the keyboard so nobody repeats it.",
      },
      {
        name: "Solve the word for bonus points",
        text: "On your turn, you can attempt to solve the whole word instead of guessing a letter. If you are right, you earn 20 points for every letter still hidden. If you are wrong, the gallows takes a strike and your turn passes — so guess boldly, but not recklessly.",
      },
      {
        name: "The round ends solved or hanged",
        text: "Revealing the word's final letter earns a +20 completion bonus, and a successful solve ends the round on the spot. But if the strikes reach the limit first, the gallows is complete: the word is revealed and nobody earns the solve. The next round starts with a new word, and the starting turn rotates to the next player.",
      },
      {
        name: "Most points wins the match",
        text: "After the final round, the highest total score wins. If the top scores are level, the match is a draw.",
      },
    ],
  },

  strategy: {
    intro:
      "Hangman looks like vocabulary trivia, but underneath it is a probability game — and because ArcadeKit scores every reveal, turn efficiency matters as much as being right. The fundamentals:",
    tips: [
      {
        name: "Open with vowels — but spend them wisely",
        text: "Nearly every English word contains at least one of E or A, making them the safest openers. I and O follow close behind. Save U for special occasions: it is the rarest vowel, and if you see a Q revealed, the U next to it is free information.",
      },
      {
        name: "Then follow letter frequency",
        text: "After vowels, the workhorse consonants are R, S, T, L, and N — the same letters Wheel of Fortune hands contestants for free, because they are the most common in English. A vowel-plus-RSTLN opening typically reveals half the word's skeleton before you risk anything exotic.",
      },
      {
        name: "Read the pattern, not just the letters",
        text: "Blanks carry information. A seven-letter word ending in _ _ _ _ I N G almost certainly ends in -ING; a revealed T at position two suggests an S or a vowel up front; double blanks between known letters hint at OO, EE, LL, or SS. Word endings (-ER, -ED, -TION) and starts (TH-, CH-, ST-) crack more words than rare-letter fishing ever will.",
      },
      {
        name: "Use the theme as a filter",
        text: "The category plus the word length is a powerful sieve. Eight letters in the Animals theme? Start running FLAMINGO, KANGAROO, ELEPHANT against the revealed letters. The moment two or three letters confirm a single candidate, stop guessing letters — it is solve time.",
      },
      {
        name: "Do the solve math",
        text: "Solving pays 20 points per hidden letter, while guessing letters pays 10 per appearance. With four or more letters still hidden and a confident read, the solve is the biggest single play in the game — 80+ points in one move. With only one letter left, guessing that letter (10 points plus the 20-point completion bonus) beats solving. And remember a failed solve hands the turn away with a strike attached.",
      },
      {
        name: "Respect the gallows",
        text: "The gallows is shared, and it changes value as it fills. Early on, speculative guesses are cheap. At one or two strikes from the end, a wrong guess doesn't just pass your turn — it risks killing the round and everyone's chance at the solve bonus. Late-gallows turns are for safe letters and sure solves only.",
      },
    ],
  },

  variations: {
    intro:
      "Hangman's guess-the-word core has spawned dozens of formats — these are the ones most worth trying:",
    items: [
      {
        name: "Classic paper duel",
        text: "The original two-player version: one player secretly writes the word and draws the gallows, the other guesses. The setter's craft is picking short words with rare letters — see the FAQ on why “jazz” is legendary.",
      },
      {
        name: "Phrase rounds",
        text: "Wheel of Fortune style: hide a multi-word phrase, movie title, or song name instead of a single word, with spaces shown. Phrases are more forgiving per letter but demand broader guessing.",
      },
      {
        name: "Evil hangman",
        text: "A devious computer-science classic: the setter doesn't commit to a word at all. Instead they keep the largest possible family of words consistent with every answer given, only settling when forced. Nearly unbeatable, and a famous programming exercise for exactly that reason.",
      },
      {
        name: "Speed hangman",
        text: "Add a per-turn timer — ten seconds to pick a letter. The frequency tables in your head matter a lot more when there is no time to run the alphabet.",
      },
    ],
  },

  faq: [
    {
      question: "What are the best letters to guess first in hangman?",
      answer:
        "Start with E and A — the two most common letters in English words — then I and O, then the heavy-duty consonants R, S, T, L, and N. This ordering follows real letter-frequency data and reveals the word's skeleton fastest. Adjust for length: very short words are actually likelier to dodge common letters, which is exactly what makes them hard.",
    },
    {
      question: "What is the hardest hangman word?",
      answer:
        "The famous answer is “jazz.” A computational analysis of hangman found short words built from rare letters with repeats — jazz, buzz, jinx, fuzz — to be the deadliest, because standard frequency-based guessing burns through the gallows before touching a J or Z. The general recipe for a brutal word: four letters or fewer, one uncommon vowel, and rare consonants that repeat.",
    },
    {
      question: "How many wrong guesses are allowed in hangman?",
      answer:
        "Tradition draws a six-part figure — head, body, two arms, two legs — giving six wrong guesses. Many households extend the drawing with scaffold pieces, a face, or feet to allow anywhere from eight to thirteen misses. ArcadeKit lets the host choose 6, 8, or 10 strikes per round, with more of the gallows pre-drawn at stricter settings.",
    },
    {
      question: "Can more than two people play hangman?",
      answer:
        "Yes. The paper classic is a two-player duel, but ArcadeKit's version supports up to eight players competing on the same word: turns rotate, correct guesses score points and keep the turn, and wrong guesses pass it along with a strike. The shared gallows makes it cooperative and cutthroat at the same time.",
    },
    {
      question: "When should I try to solve the word instead of guessing letters?",
      answer:
        "In ArcadeKit hangman, solving earns 20 points per still-hidden letter, while a correct letter earns 10 per appearance. The break-even is quick: if three or more letters are hidden and you are confident, solving is the higher-scoring play — and it denies everyone else the chance. With one letter left, guess it as a letter instead: 10 points plus the 20-point completion bonus beats a 20-point solve.",
    },
    {
      question: "Is hangman good for kids and spelling practice?",
      answer:
        "One of the best games for it. Hangman drills letter patterns, phonics, and vocabulary without feeling like practice, and the drawing gives even losing rounds a fun payoff. For young players, pick concrete themes like Animals or Food, use the 10-strike setting, and celebrate near-misses — the learning happens in the guessing, not the winning.",
    },
  ],

  gear: {
    intro:
      "Hangman needs nothing but a pencil — but a couple of physical versions travel better than paper:",
    items: [
      {
        name: "Wooden hangman travel set",
        blurb:
          "A compact board with letter tiles and a peg figure — the classic duel in a form that survives car trips and cafe tables.",
        searchQuery: "wooden hangman game travel set",
      },
      {
        name: "Wheel of Fortune board game",
        blurb:
          "The phrase-guessing cousin at family-game-night scale, complete with the wheel. Perfect if your group graduates to phrase rounds.",
        searchQuery: "wheel of fortune board game",
      },
    ],
  },
};
