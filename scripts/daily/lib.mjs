// ============================================================
// ArcadeKit — Daily Rank: helpers for the data scripts
// ============================================================

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const ITEMS_DIR = join(ROOT, "src", "lib", "daily", "items");

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Round to 3 significant figures (or whole numbers for years/counts) */
function tidy(value) {
  if (Number.isInteger(value)) return value;
  return Number(value.toPrecision(4));
}

/**
 * Write a category's items, most famous first, so a diff after a
 * refresh shows the items people will actually see.
 */
export function writeItems(categoryId, items, source) {
  mkdirSync(ITEMS_DIR, { recursive: true });
  const sorted = [...items]
    .map((item) => ({ ...item, value: tidy(item.value) }))
    .sort((a, b) => b.fame - a.fame || a.name.localeCompare(b.name));
  const file = join(ITEMS_DIR, `${categoryId}.json`);
  writeFileSync(file, JSON.stringify({ source, items: sorted }, null, 1) + "\n");
}
