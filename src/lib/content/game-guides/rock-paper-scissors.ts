// ============================================================
// ArcadeKit — How to Play Guide: Rock Paper Scissors
// ============================================================

import type { GameGuide } from "./types";

export const rockPaperScissorsGuide: GameGuide = {
  gameId: "rock-paper-scissors",
  gameName: "Rock Paper Scissors",
  emoji: "✊",
  accentColor: "#F97316",

  metaTitle: "How to Play Rock Paper Scissors: Rules, Psychology & Winning Strategy",
  metaDescription:
    "Rock paper scissors is not pure luck. Learn the rules, the psychology of what people actually throw, and the proven patterns that let you win more than a third of your games.",
  keywords: [
    "how to play rock paper scissors",
    "rock paper scissors rules",
    "rock paper scissors strategy",
    "how to win rock paper scissors",
    "what do people throw first rock paper scissors",
    "rock paper scissors lizard spock rules",
  ],

  updated: "2026-07-14",
  heroTagline: "The world's fastest mind game — and no, it is not just luck.",
  totalTimeMinutes: 2,

  intro: [
    "Rock paper scissors is the universal tiebreaker: two players, three hand shapes, one simultaneous reveal. Rock crushes scissors, scissors cuts paper, paper covers rock. Everyone on Earth seems to know it, which is exactly why it is used to settle everything from who rides shotgun to genuine business disputes.",
    "But here is what most people miss: against a truly random opponent, you would win exactly one third of your throws — yet skilled players consistently beat that number. Humans are terrible at being random, and every habit, tell, and pattern is exploitable. This guide covers the rules in ten seconds and then gets to the good part: the psychology.",
  ],

  history: [
    "The game traces back over two thousand years to China, where hand games called shoushiling — “hand commands” — were played during the Han dynasty. It flourished in Japan as jan-ken, part of a family of sansukumi-ken games built on the elegant idea of three things that each defeat one another in a circle.",
    "Jan-ken spread from Japan to the West in the early 20th century, and by the 1930s rock paper scissors was a playground standard across Europe and the Americas. It has since been taken surprisingly seriously: international tournaments have crowned world champions, and in 2005 a Japanese electronics company famously had Christie's and Sotheby's play a single round of rock paper scissors for the right to auction its $20 million art collection. Christie's threw scissors — after taking strategy advice from the 11-year-old twin daughters of one of its directors — and won.",
  ],

  rules: {
    intro:
      "The full rules take longer to read than to learn. On ArcadeKit, matches are best-of-three by default:",
    steps: [
      {
        name: "Know the three throws",
        text: "Rock is a closed fist. Paper is a flat hand. Scissors is a fist with the index and middle fingers extended. Each throw beats exactly one other: rock crushes scissors, scissors cuts paper, paper covers rock.",
      },
      {
        name: "Throw simultaneously",
        text: "Both players reveal their choice at the same moment. In person, players traditionally pump their fists in unison — “rock, paper, scissors, shoot!” — and reveal on “shoot.” Online, both players lock in a choice and the reveal is simultaneous.",
      },
      {
        name: "Score the round",
        text: "The winning throw takes the round. If both players throw the same shape, the round is a tie and is replayed.",
      },
      {
        name: "Play best of three",
        text: "First player to win two rounds takes the match. Longer formats — best of five or seven — reward pattern-reading and are standard in organized play.",
      },
    ],
  },

  strategy: {
    intro:
      "Game theory says the unbeatable strategy is perfect randomness — but no human is random. Winning play means being slightly less predictable than your opponent while reading their patterns. These are the best-documented tendencies:",
    tips: [
      {
        name: "Expect rock from beginners",
        text: "Rock is the most common opening throw — it is the most instinctive, aggressive shape, and statistics from tournament play put it around 35% of all throws. Against a new opponent, opening with paper is the percentage play.",
      },
      {
        name: "Exploit win-stay, lose-shift",
        text: "The most reliable human pattern: winners tend to repeat their winning throw, and losers tend to switch — usually to the throw that just beat them. If you lose a round, assume they will repeat, and throw what beats their last throw. If you win, assume they will switch to what beat them, and plan accordingly.",
      },
      {
        name: "Watch the double run",
        text: "People rarely throw the same shape three times in a row — it feels “too obvious.” After seeing two rocks back-to-back, the smart money is on them switching, so scissors becomes a strong call (it beats paper and ties their unlikely third rock is the only risk).",
      },
      {
        name: "Announce your throw",
        text: "A classic tournament mind game: tell your opponent exactly what you are about to throw. If you say “rock” and they believe you, they throw paper — so you throw scissors. If they assume you are lying, they often throw rock to beat your implied scissors — a coin flip you have shaped. Either way, you have taken control of their thinking.",
      },
      {
        name: "When in doubt, go random-ish",
        text: "Against someone clearly reading you, break your own patterns. A genuinely mixed sequence cannot be exploited — the goal is to be the one doing the reading while giving nothing back.",
      },
    ],
  },

  variations: {
    intro:
      "The three-way circle is endlessly extendable. These are the variants most worth knowing:",
    items: [
      {
        name: "Rock Paper Scissors Lizard Spock",
        text: "The five-throw expansion popularized by The Big Bang Theory: scissors cuts paper, paper covers rock, rock crushes lizard, lizard poisons Spock, Spock smashes scissors, scissors decapitates lizard, lizard eats paper, paper disproves Spock, Spock vaporizes rock, rock crushes scissors. Ties drop from 33% to 20%.",
      },
      {
        name: "Best-of marathons",
        text: "Best-of-15 or first-to-10 formats turn the game from a coin flip into a genuine read-your-opponent contest — enough rounds for patterns to emerge and be punished.",
      },
      {
        name: "Group elimination",
        text: "With three or more players, everyone throws at once; players showing the losing shape are eliminated each round, replaying ties, until one remains. A fast way to pick who goes first in any other game.",
      },
      {
        name: "Handicap rules",
        text: "A stronger player must win by two rounds, or is banned from throwing their favorite shape. Useful for keeping siblings from flipping the table.",
      },
    ],
  },

  faq: [
    {
      question: "Is rock paper scissors luck or skill?",
      answer:
        "Against a random opponent it is pure luck — but humans are not random. Over multiple rounds, players who track tendencies like win-stay/lose-shift reliably win more than a third of their games, which is why the same names kept reaching the finals of world championships.",
    },
    {
      question: "What do most people throw first in rock paper scissors?",
      answer:
        "Rock, by a clear margin — roughly 35% of opening throws, and even higher among men and first-time players. That makes paper the statistically best blind opener against a stranger.",
    },
    {
      question: "What happens when rock paper scissors is a tie?",
      answer:
        "The round simply replays. Ties are common — about one in three rounds between unpredictable players — which is why match formats are always framed as “first to N wins” rather than a fixed number of throws.",
    },
    {
      question: "Can more than two people play rock paper scissors?",
      answer:
        "Yes. In group play, everyone throws simultaneously and the losing shape is eliminated each round (if all three shapes appear, the round replays). It works as a quick elimination bracket for any group decision.",
    },
    {
      question: "Has rock paper scissors decided anything important?",
      answer:
        "Famously, yes. In 2005 the Maspro Denkoh corporation had auction houses Christie's and Sotheby's play one round to decide who would sell its $20 million art collection. Christie's won with scissors. Courts and leagues have used it too — a US federal judge once ordered opposing lawyers to settle a deposition-location dispute with it.",
    },
  ],

  gear: {
    intro:
      "You will never need equipment for this one — but if the game has you hooked, the culture around it is worth a read:",
    items: [
      {
        name: "The Official Rock Paper Scissors Strategy Guide",
        blurb:
          "The tongue-in-cheek but genuinely insightful book by the founders of the World RPS Society — gambit theory, tells, and tournament lore.",
        searchQuery: "official rock paper scissors strategy guide book",
      },
    ],
  },

  relatedTool: {
    slug: "coin-flip",
    name: "Coin Flip",
    blurb:
      "Need a truly random decision instead of a mind game? Flip a virtual coin — no psychology, no reads, just 50/50.",
  },
};
