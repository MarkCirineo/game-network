// ============================================================
// ArcadeKit — Daily Rank: Wikidata categories
// Pulls item lists from Wikidata (CC0) and writes one JSON file per
// category to src/lib/daily/items/. Run by hand when adding or
// refreshing a category, then review the output (git diff) and add
// anything wrong to that category's `exclude` list.
//
//   node scripts/daily/fetch-wikidata.mjs            all categories
//   node scripts/daily/fetch-wikidata.mjs buildings  one category
//
// Quantities use Wikidata's normalized values (SI units), so a height
// entered in feet still comes back in metres. The query service times
// out on anything clever, so each class is a separate plain query and
// names are looked up afterwards through the regular API.
// ============================================================

import { writeItems, sleep } from "./lib.mjs";

const SPARQL = "https://query.wikidata.org/sparql";
const API = "https://www.wikidata.org/w/api.php";
const USER_AGENT = "ArcadeKitDaily/0.1 (https://arcadekit.games)";

/**
 * Each category:
 *   classes    items that are an instance of any of these (one query each)
 *   match      or: a custom SPARQL pattern that binds ?item
 *   prop       the property holding the value
 *   kind       quantity (normalized to SI) | year | number
 *   minLinks   fame filter: Wikipedia language versions (sitelinks)
 *   pick       how to choose between several values: max | min | median
 *   country    true to show the item's country as its detail
 *   transform  optional value conversion (e.g. m² → km²)
 *   minValue   drop items below this (after transform)
 *   include    allowlist of ids, for sources too mixed to filter
 *   exclude    Wikidata ids to drop after review, with the reason
 *   rename     display-name fixes
 *   details    detail-line fixes (e.g. a wrong second country)
 */
const CATEGORIES = {
  // ---------------- Nature ----------------
  mountains: {
    classes: ["Q8502", "Q8072", "Q169358", "Q1595289"],
    prop: "P2044",
    kind: "quantity",
    minLinks: 45,
    pick: "max",
    country: true,
    exclude: {
      Q83497: "Mount Rushmore: famous for the carving, not the height",
      Q173564: "Temple Mount: a religious site, not a mountain people know by height",
      Q130321: "Mount Athos: known as the monastic peninsula",
    },
  },
  rivers: {
    classes: ["Q4022"],
    prop: "P2043",
    kind: "quantity",
    minLinks: 50,
    pick: "max",
    country: true,
    transform: (m) => m / 1000,
    exclude: {},
  },
  lakes: {
    classes: ["Q23397", "Q1140845", "Q211302", "Q131681"],
    prop: "P2046",
    kind: "quantity",
    minLinks: 45,
    pick: "max",
    country: true,
    transform: (m2) => m2 / 1e6,
    exclude: {},
  },
  islands: {
    // Single islands only (archipelagos and island countries muddle "area")
    classes: ["Q23442"],
    prop: "P2046",
    kind: "quantity",
    minLinks: 70,
    pick: "max",
    country: true,
    transform: (m2) => m2 / 1e6,
    exclude: {
      Q398: "Bahrain: a country, and the area is the whole archipelago",
      Q5765: "Balearic Islands: a group",
      Q35672: "Pitcairn Islands: a group",
      Q25231: "Svalbard: an archipelago",
      Q38095: "Galápagos Islands: a group",
      Q38272: "British Isles: a group",
      Q80389: "Kuril Islands: a group",
      Q42314: "Channel Islands: a group",
      Q3803: "Lesser Sunda Islands: a group",
      Q93259: "Lesser Antilles: a group",
    },
  },

  // ---------------- Built ----------------
  buildings: {
    classes: ["Q11303", "Q41176", "Q12518", "Q11755880", "Q1021645"],
    prop: "P2048",
    kind: "quantity",
    minLinks: 25,
    pick: "max",
    country: true,
    minValue: 100,
    exclude: {},
  },
  stadiums: {
    classes: ["Q483110", "Q1076486", "Q2338524"],
    prop: "P1083",
    kind: "number",
    minLinks: 30,
    pick: "max",
    country: true,
    minValue: 10000,
    exclude: {
      Q10285: "Colosseum: an ancient ruin, capacity is an estimate",
    },
  },
  // ---------------- History ----------------
  inventions: {
    // Wikidata's "discovered or invented" also covers places, elements
    // and diseases, so this one keeps a hand-picked list. Where the
    // year is disputed (car, bicycle, steam locomotive) the item is
    // left out rather than argued over.
    match: "?item wdt:P575 [] .",
    prop: "P575",
    kind: "year",
    minLinks: 80,
    pick: "min",
    country: false,
    include: [
      "Q68", "Q11035", "Q11633", "Q11032", "Q197", "Q872", "Q17517", "Q9158",
      "Q5994", "Q466", "Q12876", "Q6368", "Q37501", "Q37828", "Q26540", "Q5339",
      "Q4439", "Q38867", "Q12190", "Q49013", "Q79897", "Q47616", "Q80728", "Q72313",
      "Q128015", "Q80831", "Q101674", "Q79757", "Q127956", "Q133585", "Q58148",
      "Q1049294", "Q160137", "Q5297", "Q49833", "Q101761", "Q8076", "Q483400",
      "Q144334", "Q267298", "Q11658", "Q47433", "Q81103", "Q133036", "Q132560",
      "Q5372", "Q1734",
    ],
    exclude: {},
  },
  companies: {
    classes: ["Q4830453", "Q891723"],
    prop: "P571",
    kind: "year",
    minLinks: 70,
    pick: "min",
    country: true,
    exclude: {
      // Not companies people think of as companies
      Q1422: "Juventus: a football club",
      Q81888: "Ajax: a football club",
      Q18543: "Major League Soccer: a league",
      Q188822: "Asian Development Bank: a development bank",
      Q183231: "Bank of England: a central bank",
      Q105584: "Rotten Tomatoes: a website",
      Q230051: "Alexa Internet: defunct, not well known",
      Q47099: "Televisa: not well known outside Mexico",
      Q1281055: "TV Azteca: not well known outside Mexico",
      Q83164: "East India Company: a historical trading company",
      Q159766: "Dutch East India Company: a historical trading company",
      Q14647: "Sun Microsystems: defunct",
      // The year is when today's legal entity formed, not the founding
      Q35476: "AT&T: 2005 is the SBC merger",
      Q7240: "Lockheed Martin: 1995 is the merger",
      Q188514: "Tata Motors: year is wrong on Wikidata",
      Q27530: "Mercedes-Benz Group: 1998 is the Daimler-Chrysler merger",
      Q20800404: "Alphabet: a holding company for Google",
      Q156238: "ExxonMobil: 1882 vs 1999 is disputed",
      Q154950: "Shell: 1890 vs 1907 is disputed",
      Q158888: "Yamaha Motor: easy to confuse with Yamaha (1887)",
    },
    rename: {
      Q312: "Apple",
      Q7414: "Disney",
      Q3895: "Adidas",
      Q23317: "Audi",
      Q41187: "Sony",
      Q44294: "Ford",
      Q53247: "Panasonic",
      Q170416: "Philips",
      Q3295867: "Coca-Cola",
      Q163810: "Volvo",
      Q62621: "Canon",
      Q181642: "Suzuki",
      Q55931: "Hyundai",
      Q380: "Meta (Facebook)",
      Q19900: "Oracle",
      Q32491: "Qantas",
      Q178516: "Gucci",
    },
    details: {
      Q55931: "South Korea",
      Q780442: "United States",
    },
  },
};

function valuePattern(prop, kind) {
  const base = `?item p:${prop} ?st . ?st wikibase:rank ?rank .`;
  if (kind === "quantity") return `${base} ?st psn:${prop}/wikibase:quantityAmount ?value .`;
  if (kind === "number") return `${base} ?st ps:${prop} ?value .`;
  return `${base} ?st psv:${prop} ?tv . ?tv wikibase:timeValue ?t ; wikibase:timePrecision ?prec .
    FILTER(?prec >= 9) BIND(YEAR(?t) AS ?value)`;
}

function buildQuery(match, def) {
  return `SELECT ?item ?links ?value ?rank ?country WHERE {
  ${match}
  ?item wikibase:sitelinks ?links .
  FILTER(?links >= ${def.minLinks})
  ${valuePattern(def.prop, def.kind)}
  ${def.country ? "OPTIONAL { ?item wdt:P17 ?country . }" : ""}
}`;
}

async function fetchWithRetry(url, init) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return await res.json();
      console.warn(`  request failed (${res.status}), attempt ${attempt}: ${(await res.text()).slice(0, 200)}`);
    } catch (error) {
      console.warn(`  request failed (${error.message}), attempt ${attempt}`);
    }
    await sleep(5000 * attempt);
  }
  throw new Error(`Request kept failing: ${url.slice(0, 120)}`);
}

async function runQuery(query) {
  const url = `${SPARQL}?${new URLSearchParams({ query, format: "json" })}`;
  const data = await fetchWithRetry(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/sparql-results+json" },
  });
  return data.results.bindings;
}

/** English labels for a list of ids, 50 per request */
async function fetchLabels(ids) {
  const labels = new Map();
  const unique = [...new Set(ids)];
  for (let i = 0; i < unique.length; i += 50) {
    const params = new URLSearchParams({
      action: "wbgetentities",
      ids: unique.slice(i, i + 50).join("|"),
      props: "labels",
      languages: "en",
      format: "json",
    });
    const data = await fetchWithRetry(`${API}?${params}`, { headers: { "User-Agent": USER_AGENT } });
    for (const [id, entity] of Object.entries(data.entities)) {
      const label = entity.labels?.en?.value;
      if (label) labels.set(id, label);
    }
  }
  return labels;
}

const idOf = (uri) => uri.split("/").pop();

/** Wikidata labels for things like "computer" are lowercase */
const capitalize = (label) => label && label[0].toUpperCase() + label.slice(1);

/** Everyday names for countries whose Wikidata label is formal */
const COUNTRY_NAMES = {
  "People's Republic of China": "China",
  "Democratic Republic of the Congo": "DR Congo",
  "Republic of the Congo": "Congo",
  "Kingdom of the Netherlands": "Netherlands",
  "realm of the United Kingdom": "United Kingdom",
  "Kingdom of Denmark": "Denmark",
  "State of Palestine": "Palestine",
};
const countryName = (label) => (label && COUNTRY_NAMES[label]) ?? label;

function pickValue(values, how) {
  const sorted = [...values].sort((a, b) => a - b);
  if (how === "min") return sorted[0];
  if (how === "max") return sorted[sorted.length - 1];
  return sorted[Math.floor(sorted.length / 2)];
}

async function fetchCategory(id, def) {
  console.log(`${id}…`);
  const matches = def.match ? [def.match] : def.classes.map((c) => `?item wdt:P31 wd:${c} .`);

  const byItem = new Map();
  for (const match of matches) {
    const rows = await runQuery(buildQuery(match, def));
    console.log(`  ${match} → ${rows.length} rows`);
    for (const row of rows) {
      const qid = idOf(row.item.value);
      const entry = byItem.get(qid) ?? {
        qid,
        preferred: new Set(),
        normal: new Set(),
        countries: new Set(),
        links: Number(row.links.value),
      };
      const value = Number(row.value.value);
      const rank = row.rank.value.split("#").pop();
      // Years can be negative (BC); everything else must be positive
      if (Number.isFinite(value) && (def.kind === "year" ? value !== 0 : value > 0)) {
        if (rank === "PreferredRank") entry.preferred.add(value);
        else if (rank === "NormalRank") entry.normal.add(value);
      }
      if (row.country) entry.countries.add(idOf(row.country.value));
      byItem.set(qid, entry);
    }
    await sleep(1000);
  }

  const include = def.include ? new Set(def.include) : null;
  const entries = [...byItem.values()].filter((e) => !def.exclude[e.qid] && (!include || include.has(e.qid)));
  const labels = await fetchLabels(entries.flatMap((e) => [e.qid, ...e.countries]));

  const items = [];
  for (const entry of entries) {
    // A preferred value is Wikidata's "this is the current one"
    const values = entry.preferred.size > 0 ? entry.preferred : entry.normal;
    const name = def.rename?.[entry.qid] ?? capitalize(labels.get(entry.qid));
    if (values.size === 0 || !name) continue;
    let value = pickValue([...values], def.pick);
    if (def.transform) value = def.transform(value);
    if (def.minValue !== undefined && value < def.minValue) continue;
    const countries = [...new Set([...entry.countries].map((c) => countryName(labels.get(c))).filter(Boolean))].sort();
    items.push({
      id: entry.qid,
      name,
      detail: def.details?.[entry.qid] ?? (countries.length > 2 ? `${countries.slice(0, 2).join(", ")} and others` : countries.join(" / ") || undefined),
      value,
      fame: entry.links,
      source: `https://www.wikidata.org/wiki/${entry.qid}`,
    });
  }

  writeItems(id, items, "Wikidata (CC0)");
  console.log(`  ${items.length} items`);
}

const only = process.argv[2];
for (const [id, def] of Object.entries(CATEGORIES)) {
  if (only && id !== only) continue;
  await fetchCategory(id, def);
}
