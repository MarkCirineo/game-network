// ============================================================
// ArcadeKit — Daily Rank: famous structures by height
// Hand-entered from each structure's Wikipedia article (linked):
// height to the architectural top (spires count, antennas don't),
// or to the top of the statue/torch. World-famous ones only.
//
//   node scripts/daily/build-structures.mjs
// ============================================================

import { writeItems } from "./lib.mjs";

const wiki = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;

// [name, country, height in metres, fame (rough, 1–100), Wikipedia title]
const STRUCTURES = [
  ["Burj Khalifa", "United Arab Emirates", 828, 95, "Burj Khalifa"],
  ["Tokyo Skytree", "Japan", 634, 70, "Tokyo Skytree"],
  ["Shanghai Tower", "China", 632, 65, "Shanghai Tower"],
  ["CN Tower", "Canada", 553, 75, "CN Tower"],
  ["One World Trade Center", "United States", 541, 85, "One World Trade Center"],
  ["Taipei 101", "Taiwan", 508, 70, "Taipei 101"],
  ["Petronas Towers", "Malaysia", 452, 70, "Petronas Towers"],
  ["Empire State Building", "United States", 443, 95, "Empire State Building"],
  ["Eiffel Tower", "France", 330, 100, "Eiffel Tower"],
  ["Chrysler Building", "United States", 319, 75, "Chrysler Building"],
  ["The Shard", "United Kingdom", 310, 70, "The Shard"],
  ["Golden Gate Bridge (towers)", "United States", 227, 90, "Golden Gate Bridge"],
  ["Gateway Arch", "United States", 192, 70, "Gateway Arch"],
  ["Space Needle", "United States", 184, 75, "Space Needle"],
  ["Washington Monument", "United States", 169, 80, "Washington Monument"],
  ["Great Pyramid of Giza", "Egypt", 139, 100, "Great Pyramid of Giza"],
  ["St. Peter's Basilica", "Vatican City", 137, 75, "St. Peter's Basilica"],
  ["London Eye", "United Kingdom", 135, 80, "London Eye"],
  ["Big Ben", "United Kingdom", 96, 95, "Big Ben"],
  ["Statue of Liberty", "United States", 93, 100, "Statue of Liberty"],
  ["Taj Mahal", "India", 73, 95, "Taj Mahal"],
  ["Leaning Tower of Pisa", "Italy", 56, 90, "Leaning Tower of Pisa"],
  ["Arc de Triomphe", "France", 50, 80, "Arc de Triomphe"],
  ["Colosseum", "Italy", 48, 95, "Colosseum"],
  ["Christ the Redeemer", "Brazil", 30, 90, "Christ the Redeemer (statue)"],
  ["Great Sphinx of Giza", "Egypt", 20, 85, "Great Sphinx of Giza"],
  ["Mount Rushmore (faces)", "United States", 18, 85, "Mount Rushmore"],
  ["Stonehenge", "United Kingdom", 7.3, 90, "Stonehenge"],
];

writeItems(
  "structure-height",
  STRUCTURES.map(([name, detail, value, fame, title]) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    detail,
    value,
    fame,
    source: wiki(title),
  })),
  "Wikipedia",
);

console.log(`${STRUCTURES.length} structures written`);
