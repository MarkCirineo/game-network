// ============================================================
// ArcadeKit — Daily Rank: print upcoming puzzles with answers
//   npx tsx scripts/daily/preview.ts [from] [count]
// Uses DAILY_SEED_SECRET if set, so with the production secret it
// shows the real upcoming puzzles. Never paste that output anywhere
// public.
// ============================================================

import { dateForPuzzle, THEMES } from "../../src/lib/daily/config";
import { generatePuzzle } from "../../src/lib/daily/generator";

const from = Number(process.argv[2] ?? 1);
const count = Number(process.argv[3] ?? 30);

const categoryCounts = new Map<string, number>();

for (let n = from; n < from + count; n++) {
  const puzzle = generatePuzzle(n);
  console.log(`\n#${n}  ${dateForPuzzle(n)}`);
  for (const round of puzzle.rounds) {
    categoryCounts.set(round.categoryId, (categoryCounts.get(round.categoryId) ?? 0) + 1);
    const byId = new Map(round.shown.map((item) => [item.id, item]));
    const answer = round.answer.map((id) => {
      const item = byId.get(id)!;
      return `${item.name} (${item.display})`;
    });
    console.log(`  ${THEMES[round.theme].emoji} ${round.title} [${round.top} first]`);
    console.log(`     ${answer.join("  >  ")}`);
  }
}

console.log("\nCategory use:");
for (const [id, uses] of [...categoryCounts].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id.padEnd(20)} ${uses}`);
}
