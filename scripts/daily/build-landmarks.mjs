// ============================================================
// ArcadeKit — Daily Rank: landmarks by year completed
// Typed in by hand: Wikidata mixes "construction started" and
// "finished", which made this category argue with itself. Each year
// is when the landmark was finished or opened, per its Wikipedia
// article (linked). Negative years are BC. Ancient dates are
// approximate, so the category's gap rule keeps close ones apart.
//
//   node scripts/daily/build-landmarks.mjs
// ============================================================

import { writeItems } from "./lib.mjs";

const wiki = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;

// [name, country, year finished, fame (rough, 1–100), Wikipedia title]
const LANDMARKS = [
  ["Great Pyramid of Giza", "Egypt", -2560, 100, "Great Pyramid of Giza"],
  ["Parthenon", "Greece", -432, 85, "Parthenon"],
  ["Colosseum", "Italy", 80, 100, "Colosseum"],
  ["Pantheon", "Italy", 125, 75, "Pantheon, Rome"],
  ["Hagia Sophia", "Turkey", 537, 80, "Hagia Sophia"],
  ["Angkor Wat", "Cambodia", 1150, 75, "Angkor Wat"],
  ["Notre-Dame de Paris", "France", 1345, 90, "Notre-Dame de Paris"],
  ["Leaning Tower of Pisa", "Italy", 1372, 90, "Leaning Tower of Pisa"],
  ["Forbidden City", "China", 1420, 80, "Forbidden City"],
  ["Machu Picchu", "Peru", 1450, 90, "Machu Picchu"],
  ["Saint Basil's Cathedral", "Russia", 1561, 75, "Saint Basil's Cathedral"],
  ["St. Peter's Basilica", "Vatican City", 1626, 80, "St. Peter's Basilica"],
  ["Taj Mahal", "India", 1653, 100, "Taj Mahal"],
  ["Buckingham Palace", "United Kingdom", 1703, 85, "Buckingham Palace"],
  ["Brandenburg Gate", "Germany", 1791, 75, "Brandenburg Gate"],
  ["White House", "United States", 1800, 90, "White House"],
  ["Arc de Triomphe", "France", 1836, 80, "Arc de Triomphe"],
  ["Big Ben", "United Kingdom", 1859, 95, "Big Ben"],
  ["Suez Canal", "Egypt", 1869, 75, "Suez Canal"],
  ["Washington Monument", "United States", 1884, 75, "Washington Monument"],
  ["Statue of Liberty", "United States", 1886, 100, "Statue of Liberty"],
  ["Eiffel Tower", "France", 1889, 100, "Eiffel Tower"],
  ["Tower Bridge", "United Kingdom", 1894, 80, "Tower Bridge"],
  ["Panama Canal", "Panama", 1914, 75, "Panama Canal"],
  ["Lincoln Memorial", "United States", 1922, 70, "Lincoln Memorial"],
  ["Empire State Building", "United States", 1931, 95, "Empire State Building"],
  ["Christ the Redeemer", "Brazil", 1931, 90, "Christ the Redeemer (statue)"],
  ["Hoover Dam", "United States", 1936, 75, "Hoover Dam"],
  ["Golden Gate Bridge", "United States", 1937, 95, "Golden Gate Bridge"],
  ["Mount Rushmore", "United States", 1941, 85, "Mount Rushmore"],
  ["Atomium", "Belgium", 1958, 60, "Atomium"],
  ["Space Needle", "United States", 1962, 70, "Space Needle"],
  ["Gateway Arch", "United States", 1965, 65, "Gateway Arch"],
  ["Sydney Opera House", "Australia", 1973, 95, "Sydney Opera House"],
  ["CN Tower", "Canada", 1976, 75, "CN Tower"],
  ["Louvre Pyramid", "France", 1989, 75, "Louvre Pyramid"],
  ["London Eye", "United Kingdom", 2000, 80, "London Eye"],
  ["Taipei 101", "Taiwan", 2004, 65, "Taipei 101"],
  ["Burj Khalifa", "United Arab Emirates", 2010, 95, "Burj Khalifa"],
  ["The Shard", "United Kingdom", 2012, 65, "The Shard"],
];

writeItems(
  "landmarks",
  LANDMARKS.map(([name, detail, value, fame, title]) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    detail,
    value,
    fame,
    source: wiki(title),
  })),
  "Wikipedia",
);

console.log(`${LANDMARKS.length} landmarks written`);
