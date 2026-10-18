// ============================================================
// ArcadeKit — Daily Rank: World categories from GeoNames
// Reads the GeoNames files TerraVia's seed uses and writes one JSON
// file per category to src/lib/daily/items/. GeoNames is CC BY 4.0:
// the daily page credits it.
//
//   node scripts/daily/build-geonames.mjs [path/to/data]
//
// The data folder defaults to ../travel-map/prisma/data (needs
// countryInfo.txt and cities500.txt). The files aren't committed here.
// ============================================================

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { writeItems } from "./lib.mjs";

const dataDir = resolve(process.argv[2] ?? "../travel-map/prisma/data");
const SOURCE = "GeoNames (CC BY 4.0)";

const MIN_COUNTRY_POPULATION = 1_000_000;
const MIN_CITY_POPULATION = 1_000_000;

const CONTINENTS = {
  AF: "Africa",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  SA: "South America",
  OC: "Oceania",
  AN: "Antarctica",
};

/** Shorter everyday names for a few GeoNames country names */
const COUNTRY_NAMES = {
  "Democratic Republic of the Congo": "DR Congo",
  "Republic of the Congo": "Congo",
  "Bosnia and Herzegovina": "Bosnia & Herzegovina",
  "The Netherlands": "Netherlands",
};

/**
 * Countries most players will have heard of: the daily puzzle only
 * uses these. A future geography pack can use the full list.
 */
const WELL_KNOWN_COUNTRIES = new Set([
  // Americas
  "US", "CA", "MX", "CU", "JM", "CR", "PA",
  "BR", "AR", "CL", "CO", "PE", "VE", "EC", "UY",
  // Europe
  "GB", "IE", "FR", "DE", "IT", "ES", "PT", "NL", "BE", "CH", "AT",
  "SE", "NO", "DK", "FI", "PL", "CZ", "HU", "GR", "RO", "HR", "UA", "RU",
  // Middle East and Africa
  "TR", "IL", "JO", "LB", "SY", "IQ", "IR", "SA", "AE", "QA", "KW",
  "EG", "MA", "DZ", "NG", "GH", "KE", "ET", "CD", "ZA", "ZW",
  // Asia and Oceania
  "AF", "PK", "IN", "BD", "NP", "LK", "CN", "JP", "KR", "KP", "TW",
  "KZ", "VN", "TH", "KH", "MM", "PH", "ID", "MY", "SG", "AU", "NZ",
]);

/** Capitals for "north to south": about 60 that most players know */
const WELL_KNOWN_CAPITALS = new Set([
  "US", "CA", "MX", "CU", "BR", "AR", "CL", "CO", "PE", "VE",
  "GB", "IE", "FR", "DE", "IT", "ES", "PT", "NL", "BE", "CH", "AT",
  "SE", "NO", "DK", "FI", "PL", "CZ", "HU", "GR", "UA", "RU",
  "TR", "SA", "AE", "IR", "IQ", "EG", "MA", "NG", "KE", "ET", "ZA", "GH",
  "AF", "PK", "IN", "BD", "NP", "CN", "JP", "KR", "KP", "VN", "TH",
  "PH", "ID", "MY", "SG", "AU", "NZ",
]);

/** Everyday names for a few GeoNames capital names */
const CAPITAL_NAMES = {
  Washington: "Washington, D.C.",
};

/** Regional-indicator flag emoji from an ISO 3166 alpha-2 code */
const flag = (iso) => String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const geonamesUrl = (id) => `https://www.geonames.org/${id}`;

// ---------------- Countries ----------------

const countries = readFileSync(join(dataDir, "countryInfo.txt"), "utf8")
  .split("\n")
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => {
    const c = line.split("\t");
    return {
      iso: c[0],
      name: COUNTRY_NAMES[c[4]] ?? c[4],
      capital: c[5],
      area: Number(c[6]),
      population: Number(c[7]),
      continent: CONTINENTS[c[8]],
      geonameId: c[16],
    };
  })
  .filter((c) => c.population >= MIN_COUNTRY_POPULATION && c.area > 0);

const countryByIso = new Map(countries.map((c) => [c.iso, c]));

const countryItem = (c, value) => ({
  id: c.iso,
  name: c.name,
  emoji: flag(c.iso),
  detail: c.continent,
  value,
  fame: c.population,
  source: geonamesUrl(c.geonameId),
});

const wellKnown = countries.filter((c) => WELL_KNOWN_COUNTRIES.has(c.iso));
const missing = [...WELL_KNOWN_COUNTRIES].filter((iso) => !countryByIso.has(iso));
if (missing.length) console.warn(`Not in the country data (under 1M people?): ${missing.join(", ")}`);

writeItems("country-population", wellKnown.map((c) => countryItem(c, c.population)), SOURCE);
writeItems("country-area", wellKnown.map((c) => countryItem(c, c.area)), SOURCE);
writeItems("country-density", wellKnown.map((c) => countryItem(c, c.population / c.area)), SOURCE);

// ---------------- Cities ----------------
// cities500 columns: geonameid, name, asciiname, alternatenames, lat,
// lng, feature class, feature code, country code, cc2, admin1..4,
// population, elevation, dem, timezone, modified

const cities = readFileSync(join(dataDir, "cities500.txt"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const c = line.split("\t");
    return {
      id: c[0],
      name: c[1],
      lat: Number(c[4]),
      featureCode: c[7],
      iso: c[8],
      population: Number(c[14]) || 0,
      dem: Number(c[16]),
    };
  })
  .filter((c) => countryByIso.has(c.iso));

const cityItem = (c, value, extra = {}) => {
  const country = countryByIso.get(c.iso);
  return {
    id: c.id,
    name: c.name,
    emoji: flag(c.iso),
    detail: country.name,
    value,
    fame: c.population,
    source: geonamesUrl(c.id),
    ...extra,
  };
};

// Capitals: the PPLC entry for each country (largest if several)
const capitals = new Map();
for (const city of cities) {
  if (city.featureCode !== "PPLC") continue;
  const current = capitals.get(city.iso);
  if (!current || city.population > current.population) capitals.set(city.iso, city);
}
writeItems(
  "capital-latitude",
  [...capitals.values()]
    .filter((c) => WELL_KNOWN_CAPITALS.has(c.iso))
    .map((c) => {
      const country = countryByIso.get(c.iso);
      // Fame follows the country, not the capital's own size
      return { ...cityItem(c, c.lat), name: CAPITAL_NAMES[c.name] ?? c.name, fame: country.population };
    }),
  SOURCE,
);

// Big cities by elevation (DEM value; -9999 means no data)
writeItems(
  "city-elevation",
  cities
    .filter((c) => c.population >= MIN_CITY_POPULATION && c.dem > -9999 && c.featureCode.startsWith("PPL"))
    .map((c) => cityItem(c, Math.max(c.dem, 0))),
  SOURCE,
);

console.log(`${countries.length} countries, ${capitals.size} capitals`);
