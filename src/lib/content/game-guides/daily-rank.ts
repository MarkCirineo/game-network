// ============================================================
// ArcadeKit — How to Play Guide: Daily Rank
// The single-player daily puzzle at /daily (not a multiplayer
// room game, so it sets playHref).
// ============================================================

import { DAILY_GAME_NAME, DAILY_PATH } from "@/lib/daily/config";
import type { GameGuide } from "./types";

export const dailyRankGuide: GameGuide = {
  gameId: "daily-rank",
  gameName: DAILY_GAME_NAME,
  playHref: DAILY_PATH,
  ctaText: "Today's puzzle takes about three minutes. No download, and no account needed.",
  emoji: "📅",
  accentColor: "#F97316",

  metaTitle: `How to Play ${DAILY_GAME_NAME}: Rules, Scoring & Tips for the Daily Ranking Puzzle`,
  metaDescription: `Learn how ${DAILY_GAME_NAME} works: three rounds a day of putting five things in order, how the 🟩🟨⬜ scoring adds up to 30, how percentiles and streaks work, and tips for better scores.`,
  keywords: [
    "daily ranking game",
    "daily ranking puzzle",
    "put things in order game",
    "daily trivia puzzle",
    "ranking trivia game",
    "free daily puzzle game",
  ],

  updated: "2026-10-17",
  heroTagline: "Five things, one question: put them in order. A new puzzle every day.",
  totalTimeMinutes: 3,

  intro: [
    `${DAILY_GAME_NAME} is a free daily puzzle. Each day has three rounds, and each round gives you five things and one question: tallest first, oldest first, most calories first. You put them in order, lock it in, and see the real numbers.`,
    "Everyone gets the same puzzle, and it takes about three minutes. You don't need an account to play. Rounds come from six themes, World, Animals, Built, History, Space, and Food, and three of them turn up each day.",
  ],

  history: [
    "Putting things in order is an old game-show idea. TV quizzes have long asked contestants to rank prices, dates, or survey answers, and higher-or-lower guessing games go back further still.",
    "The once-a-day format took off with Wordle in 2021: one puzzle, the same for everyone, and a grid of colored squares to share afterwards. A wave of daily games followed, from geography to math to movies. Daily Rank was added to ArcadeKit in 2026 and is built and maintained by one developer, like the rest of the site.",
  ],

  rules: {
    intro: "A day's puzzle has three rounds. Each round works the same way:",
    steps: [
      {
        name: "Read the question",
        text: "Each round shows a category and which end goes at the top, such as “Animal top speed: fastest at the top” or “Inventions: oldest at the top”.",
      },
      {
        name: "Put the five items in order",
        text: "Tap one item, then another, to swap them. On a computer you can also drag an item by the grip on its left. Take as long as you like; nothing is timed.",
      },
      {
        name: "Lock it in",
        text: "Press “Lock it in” when you're happy. You can't change a round after locking it in.",
      },
      {
        name: "See the answer",
        text: "The correct order appears with the real numbers. Each item is colored by how close you put it, and every number links to where it comes from.",
      },
      {
        name: "Score and share",
        text: "After round three you'll see your score out of 30, how it compares with everyone who played today, your streak, and a button to share your grid.",
      },
    ],
  },

  strategy: {
    intro:
      "Every item scores on its own: 2 points in exactly the right spot (🟩), 1 point one spot away (🟨), and 0 further away (⬜). So a round is worth 10 points and a day 30. A few habits help:",
    tips: [
      {
        name: "Place the ones you're sure of first",
        text: "Most rounds have an obvious top or bottom, like the blue whale in a weight round or the Great Pyramid in an oldest-first round. Pin those down, then work out the middle.",
      },
      {
        name: "Close counts",
        text: "Being one spot off still scores a point. If you're torn between two items, put them next to each other: you'll get at least one point each even if they're the wrong way round.",
      },
      {
        name: "Think in rough sizes",
        text: "Items in a round are always clearly apart, never a near tie. Ask which ones are in a different league entirely (a mouse and a horse) before splitting hairs.",
      },
      {
        name: "Read Food rounds carefully",
        text: "Food rounds compare 100 grams of each food, not a typical serving. That's why olive oil beats a donut on calories, and why raisins have far more sugar than grapes.",
      },
      {
        name: "Use the answers",
        text: "Categories come back every week or two. The numbers you see on the reveal today are the hints you'll want next time.",
      },
    ],
  },

  variations: {
    intro: "The puzzle is the same for everyone, which makes it easy to play together:",
    items: [
      {
        name: "Group chat league",
        text: "Everyone posts their shared grid each day and adds up scores over the week. Lowest total buys the coffee.",
      },
      {
        name: "Play it out loud",
        text: "With family or friends in the room, argue each round out together before anyone locks it in, then compare who called it right.",
      },
      {
        name: "No-swap challenge",
        text: "Decide the whole order in your head first, then set it in one go without second guesses.",
      },
    ],
  },

  faq: [
    {
      question: "When does a new puzzle come out?",
      answer: "At midnight where you are. Everyone gets the same puzzle number on the same calendar day, so you can compare results with friends in other time zones.",
    },
    {
      question: "Do I need an account?",
      answer: "No. You can play every day without one, and your streak is saved in your browser. A free account saves your streak and stats so they follow you to any device. If you sign in after playing as a guest, your guest results move to your account.",
    },
    {
      question: "How is the percentile worked out?",
      answer: "It compares your score with everyone who has finished today's puzzle so far. Players with the same score as you count as half beaten, so the number is fair when lots of people tie.",
    },
    {
      question: "What happens to my streak if I miss a day?",
      answer: "Your current streak goes back to zero, and your best streak is kept. A streak counts days in a row, so play before midnight to keep it going.",
    },
    {
      question: "Can I replay a day or play old puzzles?",
      answer: "Not yet. Each puzzle can be played once, and reloading the page picks up where you left off.",
    },
    {
      question: "Where do the numbers come from?",
      answer: "Countries and capitals come from GeoNames, inventions and companies from Wikidata, planets and moons from NASA, foods from USDA FoodData Central, and animals, landmarks, famous structures, and famous people from Wikipedia. Every answer links to its source.",
    },
    {
      question: "Is there a leaderboard?",
      answer: "There's no public leaderboard, because looking answers up would make it meaningless. Instead you see how your score compares with everyone else's today.",
    },
  ],

  gear: {
    intro: "",
    items: [],
  },
};
