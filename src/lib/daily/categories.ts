// ============================================================
// ArcadeKit — Daily Rank: categories (server only)
// Every category, including ones held back for future packs. Item lists live in
// ./items/*.json and are built by the scripts in scripts/daily/.
// This file imports the answers, so it must never be imported by
// client code.
// ============================================================

import type { ThemeId } from "./config";

import animalPregnancy from "./items/animal-pregnancy.json";
import animalSpeed from "./items/animal-speed.json";
import animalWeight from "./items/animal-weight.json";
import buildings from "./items/buildings.json";
import capitalLatitude from "./items/capital-latitude.json";
import cityElevation from "./items/city-elevation.json";
import companies from "./items/companies.json";
import countryArea from "./items/country-area.json";
import countryDensity from "./items/country-density.json";
import countryPopulation from "./items/country-population.json";
import inventions from "./items/inventions.json";
import islands from "./items/islands.json";
import lakes from "./items/lakes.json";
import landmarks from "./items/landmarks.json";
import mountains from "./items/mountains.json";
import people from "./items/people.json";
import rivers from "./items/rivers.json";
import spaceDayLength from "./items/space-day-length.json";
import spaceDiameter from "./items/space-diameter.json";
import spaceDistance from "./items/space-distance.json";
import spaceGravity from "./items/space-gravity.json";
import spaceTemperature from "./items/space-temperature.json";
import stadiums from "./items/stadiums.json";
import structureHeight from "./items/structure-height.json";

export interface DailyItem {
  id: string;
  name: string;
  emoji?: string;
  detail?: string;
  value: number;
  /** Higher = better known; weights how often an item is picked */
  fame: number;
  source: string;
}

interface ItemsFile {
  source: string;
  items: DailyItem[];
}

/**
 * Items next to each other in the answer must differ by at least
 * this much, so no round hinges on a coin flip or a stale number.
 * Both limits apply when both are set.
 */
interface Gap {
  /** Bigger value ÷ smaller value (positive values only) */
  ratio?: number;
  /** Bigger value − smaller value */
  diff?: number;
}

export interface DailyCategory {
  id: string;
  theme: ThemeId;
  /** Short name shown above the round, e.g. "Mountain height" */
  title: string;
  /** What goes at the top, e.g. "Tallest" */
  top: string;
  /** What goes at the bottom, e.g. "Shortest" */
  bottom: string;
  /** desc = biggest value at the top */
  order: "desc" | "asc";
  gap: Gap;
  /** Only the best-known N items are used */
  pool: number;
  format: (value: number) => string;
  /** Where the numbers come from, shown on the reveal */
  credit: string;
  /**
   * Set for categories most players won't know (mountains, stadiums…):
   * kept for a future themed pack, never used in the daily puzzle.
   */
  pack?: "geography" | "sports" | "architecture";
  items: DailyItem[];
}

// ---------------- Formatting ----------------

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const withUnit = (unit: string, digits = whole) => (value: number) => `${digits.format(value)} ${unit}`;

function bigNumber(value: number): string {
  if (value >= 1e9) return `${oneDecimal.format(value / 1e9)} billion`;
  if (value >= 1e6) return `${oneDecimal.format(value / 1e6)} million`;
  return whole.format(value);
}

const latitude = (value: number) => `${oneDecimal.format(Math.abs(value))}° ${value >= 0 ? "N" : "S"}`;

const year = (value: number) => (value < 0 ? `${-value} BC` : String(value));

const hours = (value: number) =>
  value >= 48 ? `${whole.format(value / 24)} Earth days` : `${oneDecimal.format(value)} hours`;

const temperature = (value: number) => `${whole.format(value)} °C`;

/** Metric first, US units in brackets: the reveal is read worldwide */
const metres = (value: number) => `${whole.format(value)} m (${whole.format(value * 3.281)} ft)`;

function weight(kg: number): string {
  if (kg < 1) return `${whole.format(kg * 1000)} g (${oneDecimal.format(kg * 35.27)} oz)`;
  const lb = kg * 2.205;
  return `${(kg < 10 ? oneDecimal : whole).format(kg)} kg (${whole.format(lb)} lb)`;
}

function speed(kmh: number): string {
  if (kmh < 1) return `${whole.format(kmh * 1000)} m per hour`;
  return `${whole.format(kmh)} km/h (${whole.format(kmh / 1.609)} mph)`;
}

const days = (value: number) =>
  value >= 60 ? `${whole.format(value)} days (about ${whole.format(value / 30.4)} months)` : `${whole.format(value)} days`;

// ---------------- Categories ----------------

const YEARS = { order: "asc" as const, top: "Oldest", bottom: "Newest", format: year };

function category(file: ItemsFile, def: Omit<DailyCategory, "items" | "credit">): DailyCategory {
  return { ...def, credit: file.source, items: file.items as DailyItem[] };
}

export const CATEGORIES: DailyCategory[] = [
  // World (GeoNames)
  category(countryPopulation, {
    id: "country-population",
    theme: "world",
    title: "Country population",
    top: "Most people",
    bottom: "Fewest people",
    order: "desc",
    gap: { ratio: 1.3 },
    pool: 100,
    format: bigNumber,
  }),
  category(countryArea, {
    id: "country-area",
    theme: "world",
    title: "Country size",
    top: "Biggest",
    bottom: "Smallest",
    order: "desc",
    gap: { ratio: 1.3 },
    pool: 100,
    format: withUnit("km²"),
  }),
  category(countryDensity, {
    id: "country-density",
    theme: "world",
    title: "Most crowded country",
    top: "Most people per km²",
    bottom: "Fewest people per km²",
    order: "desc",
    gap: { ratio: 1.4 },
    pool: 100,
    format: withUnit("people per km²"),
  }),
  category(capitalLatitude, {
    id: "capital-latitude",
    theme: "world",
    title: "Capital cities, north to south",
    top: "Farthest north",
    bottom: "Farthest south",
    order: "desc",
    gap: { diff: 4 },
    pool: 100,
    format: latitude,
  }),
  category(cityElevation, {
    id: "city-elevation",
    pack: "geography",
    theme: "world",
    title: "City elevation",
    top: "Highest",
    bottom: "Lowest",
    order: "desc",
    gap: { ratio: 1.4, diff: 150 },
    pool: 100,
    format: withUnit("m above sea level"),
  }),

  // Nature (Wikidata)
  category(mountains, {
    id: "mountains",
    pack: "geography",
    theme: "nature",
    title: "Mountain height",
    top: "Tallest",
    bottom: "Shortest",
    order: "desc",
    gap: { ratio: 1.15, diff: 300 },
    pool: 80,
    format: withUnit("m"),
  }),
  category(rivers, {
    id: "rivers",
    pack: "geography",
    theme: "nature",
    title: "River length",
    top: "Longest",
    bottom: "Shortest",
    order: "desc",
    gap: { ratio: 1.25 },
    pool: 80,
    format: withUnit("km"),
  }),
  category(lakes, {
    id: "lakes",
    pack: "geography",
    theme: "nature",
    title: "Lake size",
    top: "Biggest",
    bottom: "Smallest",
    order: "desc",
    gap: { ratio: 1.4 },
    pool: 60,
    format: withUnit("km²"),
  }),
  category(islands, {
    id: "islands",
    pack: "geography",
    theme: "nature",
    title: "Island size",
    top: "Biggest",
    bottom: "Smallest",
    order: "desc",
    gap: { ratio: 1.4 },
    pool: 45,
    format: withUnit("km²"),
  }),

  // Built (Wikidata)
  category(buildings, {
    id: "buildings",
    pack: "architecture",
    theme: "built",
    title: "Building height",
    top: "Tallest",
    bottom: "Shortest",
    order: "desc",
    gap: { ratio: 1.15, diff: 40 },
    pool: 60,
    format: withUnit("m"),
  }),
  category(stadiums, {
    id: "stadiums",
    pack: "sports",
    theme: "built",
    title: "Stadium capacity",
    top: "Most seats",
    bottom: "Fewest seats",
    order: "desc",
    gap: { ratio: 1.15, diff: 8000 },
    pool: 40,
    format: withUnit("seats"),
  }),
  category(landmarks, {
    id: "landmarks",
    theme: "built",
    title: "Landmarks, by year finished",
    ...YEARS,
    gap: { diff: 40 },
    pool: 60,
  }),

  category(structureHeight, {
    id: "structure-height",
    theme: "built",
    title: "Famous structures, by height",
    top: "Tallest",
    bottom: "Shortest",
    order: "desc",
    gap: { ratio: 1.2, diff: 15 },
    pool: 40,
    format: metres,
  }),

  // Animals (Wikipedia, hand-entered)
  category(animalWeight, {
    id: "animal-weight",
    theme: "animals",
    title: "Animal weight",
    top: "Heaviest",
    bottom: "Lightest",
    order: "desc",
    gap: { ratio: 1.5 },
    pool: 40,
    format: weight,
  }),
  category(animalSpeed, {
    id: "animal-speed",
    theme: "animals",
    title: "Animal top speed",
    top: "Fastest",
    bottom: "Slowest",
    order: "desc",
    gap: { ratio: 1.3 },
    pool: 40,
    format: speed,
  }),
  category(animalPregnancy, {
    id: "animal-pregnancy",
    theme: "animals",
    title: "Length of pregnancy",
    top: "Longest",
    bottom: "Shortest",
    order: "desc",
    gap: { ratio: 1.3 },
    pool: 40,
    format: days,
  }),

  // History (Wikidata)
  category(inventions, {
    id: "inventions",
    theme: "history",
    title: "Inventions",
    ...YEARS,
    gap: { diff: 20 },
    pool: 60,
  }),
  category(companies, {
    id: "companies",
    theme: "history",
    title: "Companies, by year founded",
    ...YEARS,
    gap: { diff: 12 },
    pool: 70,
  }),
  category(people, {
    id: "people",
    theme: "history",
    title: "Famous people, by year born",
    ...YEARS,
    top: "Born earliest",
    bottom: "Born latest",
    gap: { diff: 15 },
    pool: 60,
  }),

  // Space (NASA)
  category(spaceDiameter, {
    id: "space-diameter",
    theme: "space",
    title: "Size in space",
    top: "Biggest",
    bottom: "Smallest",
    order: "desc",
    gap: { ratio: 1.25 },
    pool: 30,
    format: withUnit("km across"),
  }),
  category(spaceDistance, {
    id: "space-distance",
    theme: "space",
    title: "Distance from the Sun",
    top: "Closest",
    bottom: "Farthest",
    order: "asc",
    gap: { ratio: 1.25 },
    pool: 20,
    format: (value) => `${bigNumber(value * 1e6)} km`,
  }),
  category(spaceDayLength, {
    id: "space-day-length",
    theme: "space",
    title: "Length of a day",
    top: "Longest day",
    bottom: "Shortest day",
    order: "desc",
    gap: { ratio: 1.25 },
    pool: 20,
    format: hours,
  }),
  category(spaceGravity, {
    id: "space-gravity",
    theme: "space",
    title: "Gravity",
    top: "Strongest pull",
    bottom: "Weakest pull",
    order: "desc",
    gap: { ratio: 1.15, diff: 0.5 },
    pool: 20,
    format: withUnit("m/s²", oneDecimal),
  }),
  category(spaceTemperature, {
    id: "space-temperature",
    theme: "space",
    title: "Average temperature",
    top: "Hottest",
    bottom: "Coldest",
    order: "desc",
    gap: { diff: 25 },
    pool: 20,
    format: temperature,
  }),
];

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

/** The categories the daily puzzle draws from */
export const DAILY_CATEGORIES = CATEGORIES.filter((c) => !c.pack);

/** True when two values are far enough apart to share a round */
export function farEnoughApart(a: number, b: number, gap: Gap): boolean {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  if (gap.diff !== undefined && high - low < gap.diff) return false;
  if (gap.ratio !== undefined && (low <= 0 || high / low < gap.ratio)) return false;
  return true;
}
