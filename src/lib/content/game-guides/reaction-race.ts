// ============================================================
// ArcadeKit — How to Play Guide: Reaction Race
// ============================================================

import type { GameGuide } from "./types";

export const reactionRaceGuide: GameGuide = {
  gameId: "reaction-race",
  gameName: "Reaction Race",
  emoji: "⚡",
  accentColor: "#22C55E",

  metaTitle: "How to Play Reaction Race: Rules, Reaction Time Science & How to Get Faster",
  metaDescription:
    "Everything about Reaction Race: the rules, what counts as a good reaction time, the science of human reflexes, why false starts happen, and training tips to shave off milliseconds.",
  keywords: [
    "reaction time game",
    "how to play reaction race",
    "what is a good reaction time",
    "reaction time test with friends",
    "how to improve reaction time",
    "reflex game online multiplayer",
  ],

  updated: "2026-07-14",
  heroTagline: "Wait for green. Click first. Two hundred fifty milliseconds of pure adrenaline.",
  totalTimeMinutes: 3,

  intro: [
    "Reaction Race is the simplest duel on ArcadeKit: everyone watches the same red screen, waits through an unpredictable delay, and the instant it flashes green — clicks. Fastest reaction takes the round. Click even one millisecond before the green and you false start, sitting out the round while your friends score.",
    "It sounds like pure reflex, and mostly it is — but there is real science in those milliseconds, and real technique in not throwing rounds away. Average human visual reaction time is around 250 milliseconds; the gap between winning and losing a round is usually smaller than the time it takes to blink. This guide covers the rules, the science, and how to be reliably on the right side of that gap.",
  ],

  history: [
    "Measuring human reaction time is one of experimental psychology's oldest projects. In 1850, Hermann von Helmholtz clocked the speed of nerve signals themselves, and in the 1860s Dutch physiologist Franciscus Donders ran the first true reaction-time experiments, proving that deciding between options takes measurably longer than reacting to a single signal — a finding that still underpins cognitive science.",
    "Sport turned reaction time into rules. Competitive sprinting counts any start faster than 100 milliseconds after the gun as a false start, on the grounds that no human can genuinely react that fast — anything quicker must be anticipation. Reaction Race draws a simpler, stricter line: click even a millisecond before the green and the round is gone. Meanwhile, online reaction testers became an internet obsession in the 2000s, with millions measuring their milliseconds — the missing ingredient was making it head-to-head, which is exactly what Reaction Race does.",
  ],

  rules: {
    intro:
      "One rule matters above all: green means go, and early means out. Here is the full round flow:",
    steps: [
      {
        name: "Gather your players",
        text: "Reaction Race supports two to eight players in a room. Everyone plays every round simultaneously — no turns, no waiting.",
      },
      {
        name: "Watch the red screen",
        text: "Each round opens with a red “wait” screen. The delay before the signal is randomized every round — sometimes one second, sometimes several — so it cannot be predicted or memorized.",
      },
      {
        name: "React on green",
        text: "The moment the screen flashes green with “GO!”, click your mouse or hit the spacebar as fast as you physically can. Your reaction time is measured on your own device in milliseconds. You have up to five seconds after the signal — anyone who never clicks is marked as no-reaction for the round.",
      },
      {
        name: "Do not jump the gun",
        text: "Clicking during the red screen is a false start: you are locked out of that round entirely and score nothing. There is no partial credit — patience is a scoring skill.",
      },
      {
        name: "Score and repeat",
        text: "The fastest valid reaction wins the round and one point. Matches run a fixed number of rounds or race to a target score; the highest total takes the match.",
      },
    ],
  },

  strategy: {
    intro:
      "You cannot think your way to a faster nervous system — but most players lose rounds to technique, not biology. Fix these and your times drop immediately:",
    tips: [
      {
        name: "React — never predict",
        text: "The random delay exists specifically to punish guessing. A false start scores zero, while even a sluggish 400ms reaction can win a round where others jumped early. Over a match, the player who never false starts beats the player who is occasionally superhuman. Wait for the green — actually wait.",
      },
      {
        name: "Use the spacebar",
        text: "For most people a keyboard press is measurably faster than a mouse click — the key travels less than a mouse button and your whole hand can hover over it. Rest a finger on the spacebar with light pressure and let the reaction fire from the finger, not the wrist.",
      },
      {
        name: "Soften your gaze at screen center",
        text: "Do not stare hard at one pixel. A relaxed, slightly de-focused gaze at the center of the play area lets your peripheral vision catch the color change everywhere at once — color arrives faster than detail in human vision, and tension slows the whole chain.",
      },
      {
        name: "Warm up before it counts",
        text: "Reaction time reliably improves over the first handful of attempts in a session as the eye-to-finger circuit warms up. Treat round one as a sighter, and expect your best times around rounds three through ten — before mental fatigue slowly pulls them back up.",
      },
      {
        name: "Cut your local lag",
        text: "Your time is measured on your own device, but your device can still slow you: a heavy game running in another tab, a cluttered browser, or a laggy wireless mouse all add milliseconds before the click registers. Close what you can and use your fastest input.",
      },
    ],
  },

  variations: {
    intro:
      "The wait-then-react formula bends into plenty of party formats:",
    items: [
      {
        name: "Elimination gauntlet",
        text: "Each round, the slowest valid reaction is eliminated until one player remains. Brutal with a full room of eight — the tension in the final head-to-head is real.",
      },
      {
        name: "Handicap rounds",
        text: "Persistent champion at the table? Require them to use their off hand, or spot everyone else 30 milliseconds. Reaction gaps are small enough that tiny handicaps genuinely level play.",
      },
      {
        name: "Solo benchmarking",
        text: "Run rounds alone and chase your personal best instead of an opponent. Track your average, not your record — consistency is the honest measure of reflex.",
      },
      {
        name: "Offline referee mode",
        text: "No screens? One player holds a ruler vertically while another pinches just below it; the referee drops it without warning and the catch height converts to reaction time. The classic physics-class version of the same game.",
      },
    ],
  },

  faq: [
    {
      question: "What is a good reaction time?",
      answer:
        "For a visual signal, the human average is roughly 250 milliseconds. Under 220ms is quick, under 200ms is genuinely fast, and sub-180ms puts you in territory occupied by competitive gamers and athletes. Elite Formula 1 drivers and esports pros test around 150–170ms — and nobody legitimately reacts under about 100ms.",
    },
    {
      question: "Why do I false start in reaction time games when my timing felt perfect?",
      answer:
        "Because it was prediction, not reaction. In Reaction Race, a false start means you clicked before the screen actually turned green — even by a few milliseconds. When you gamble on the random delay, your brain commits to the click in advance, and it often lands just barely early while feeling simultaneous to you. Sprinting fights the same phenomenon, which is why anything under 100 milliseconds after the gun counts as a false start on the track. The fix is mental: commit to reacting, and accept that a real reaction never feels instant.",
    },
    {
      question: "Does age affect reaction time?",
      answer:
        "Yes — simple reaction time is fastest in the late teens and twenties and lengthens gradually with age, by rough consensus a few milliseconds per decade. But practice, alertness, and technique routinely outweigh a decade of age difference, so mixed-age matches are far fairer than the science might suggest.",
    },
    {
      question: "Is a mouse or keyboard faster for reaction time?",
      answer:
        "Keyboard, for most people. A key press has shorter physical travel, and the spacebar lets you strike with a poised finger. If you swear by your mouse, test both across ten rounds and trust your own numbers over anyone's rule of thumb.",
    },
    {
      question: "Does internet lag make online reaction games unfair?",
      answer:
        "No — your reaction is timed on your own device, from the moment your screen turns green to the moment you press. Network latency affects when results are collected and shown, not your measured milliseconds. A slow connection cannot cost you a round.",
    },
    {
      question: "Can I actually improve my reaction time?",
      answer:
        "Within limits, yes. You cannot rebuild your nervous system, but sleep, alertness, warm-up, and practiced technique can reclaim 20–50 milliseconds of avoidable overhead — an enormous margin in this game. What improves most with practice is consistency: fewer false starts, fewer slow outliers.",
    },
  ],

  gear: {
    intro:
      "Want to train reflexes away from the screen? A couple of classics from sports training:",
    items: [
      {
        name: "Reaction ball",
        blurb:
          "A six-knobbed rubber ball that bounces unpredictably — the standard tool athletes use to drill hand-eye reaction. Cheap, portable, weirdly addictive.",
        searchQuery: "reaction ball reflex training",
      },
      {
        name: "Catch-the-light reflex game",
        blurb:
          "Tabletop reflex games with light-up buttons turn reaction training into a party contest — the physical cousin of Reaction Race.",
        searchQuery: "reflex light game handheld reaction",
      },
    ],
  },
};
