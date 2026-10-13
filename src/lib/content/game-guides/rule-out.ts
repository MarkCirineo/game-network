// ============================================================
// Rule Out — How to Play Guide
// Everything here describes how ArcadeKit's version actually
// works (see game-server/src/engines/RuleOutEngine.ts).
// ============================================================

import type { GameGuide } from "./types";

export const ruleOutGuide: GameGuide = {
  gameId: "rule-out",
  gameName: "Rule Out",
  emoji: "🕵️",
  accentColor: "#14B8A6",

  metaTitle: "How to Play Rule Out: Rules and Strategy for the Face-Guessing Game",
  metaDescription:
    "Learn how to play Rule Out, a free two-player face-guessing game. Rules for both question modes, how to pick good yes-or-no questions, and answers to common questions.",
  keywords: [
    "rule out game",
    "how to play rule out",
    "face guessing game",
    "two player guessing game",
    "yes or no questions game",
    "deduction game online",
  ],

  updated: "2026-10-12",
  heroTagline: "Find the hidden face. Ask, rule out, then make one guess.",
  totalTimeMinutes: 10,

  intro: [
    "Rule Out is a face-guessing game for two players. You each get a secret card from the same board of 24 faces, and the goal is to work out which face your opponent has before they work out yours.",
    "You narrow it down with yes-or-no questions. Every answer lets you rule out the faces that don't fit. When you think you know their card, you make one final guess: right and you win, wrong and you lose.",
  ],

  history: [
    "Rule Out was added to ArcadeKit in 2026. It's built and maintained by one developer, like the rest of the site.",
    "The 24 portraits on the classic board are AI-generated artwork made for this game. Each face was designed with a mix of traits (glasses, hats, hair color, accessories) so that yes-or-no questions split the board in useful ways.",
  ],

  rules: {
    intro:
      "A game takes two players. The host picks a question mode in the lobby before starting.",
    steps: [
      {
        name: "Get your secret card",
        text: "When the game starts, each player is given a different secret card from the board. Your card is shown at the top of your screen. Your opponent can't see it.",
      },
      {
        name: "Ask yes-or-no questions",
        text: "In “Ask out loud” mode, you ask each other questions in person or on a call, in any order. In “Take turns in the app” mode, the player whose turn it is types a question (or taps a suggested one), and the other player answers Yes or No on screen. Asking uses your turn, so the turn then passes to the other player.",
      },
      {
        name: "Rule out faces",
        text: "Tap a face to rule it out. It fades and gets crossed out. Tap it again to bring it back. Only you can see which faces you've ruled out; your opponent only sees how many you have left.",
      },
      {
        name: "Make your final guess",
        text: "Press “Make final guess”, tap the face you think your opponent has, and confirm. In turn mode you can only guess on your turn, and not while a question is waiting for an answer.",
      },
      {
        name: "Win or lose",
        text: "If your guess matches your opponent's card, you win. If it doesn't, you lose. Either way, both secret cards are revealed at the end, and you can both choose to play again with new cards.",
      },
    ],
  },

  strategy: {
    intro:
      "The fastest way to find one face out of 24 is to make every answer count.",
    tips: [
      {
        name: "Aim for questions that split the board in half",
        text: "A question that about half your remaining faces match rules out about half the board whichever way it's answered. Halving 24 faces again and again gets you to one face in about five questions. A question only one face matches usually rules out just that one face.",
      },
      {
        name: "Use the suggestions",
        text: "In turn mode, the app suggests up to four questions. They're based on the faces you haven't ruled out, and the ones closest to an even split come first. Questions that every remaining face shares, or that none do, aren't suggested, because they can't narrow anything down.",
      },
      {
        name: "Rule out after every answer",
        text: "Cross off faces as soon as you get an answer. The count of faces you have left is shown at the top, and it's easy to lose track if you wait.",
      },
      {
        name: "Don't guess too early",
        text: "A wrong final guess ends the game and you lose, so it usually pays to ask one more question when you're down to two or three faces.",
      },
    ],
  },

  variations: {
    intro:
      "The app has two built-in modes, and you can add your own house rules on top.",
    items: [
      {
        name: "Ask out loud",
        text: "The default mode. There are no turns in the app: you talk to each other and either player can make a final guess at any time. Good when you're in the same room or on a call.",
      },
      {
        name: "Take turns in the app",
        text: "Questions and answers happen on screen, one turn at a time, with a history of every question asked. Good when you can't talk to each other.",
      },
      {
        name: "House rule: question limit",
        text: "Agree on a maximum number of questions before you start. The app keeps a numbered history in turn mode, so you can check the count.",
      },
    ],
  },

  faq: [
    {
      question: "Do I need an account to play?",
      answer:
        "No. Create a room, share the link, and your friend joins with just a name.",
    },
    {
      question: "How many people can play?",
      answer:
        "Two players. Anyone else who opens the room link while the game is full or already started joins as a spectator and can watch.",
    },
    {
      question: "Can my opponent see which faces I've ruled out?",
      answer:
        "No. They only see how many faces you have left. Spectators can't see either player's secret card until the game ends.",
    },
    {
      question: "What if someone answers a question wrong?",
      answer:
        "The app can't check answers, so the game relies on both players answering honestly. If a mistake happens, you can bring ruled-out faces back by tapping them again.",
    },
    {
      question: "Can I guess a face I've already ruled out?",
      answer:
        "Yes. The app doesn't stop you, so check your pick before you confirm.",
    },
    {
      question: "Who goes first in turn mode?",
      answer:
        "The app picks the first player at random each game.",
    },
  ],

  gear: {
    intro:
      "Rule Out runs entirely in the browser. You don't need anything except a phone or computer for each player.",
    items: [],
  },
};
