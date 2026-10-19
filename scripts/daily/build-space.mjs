// ============================================================
// ArcadeKit — Daily Rank: Space categories (NASA, public domain)
// Values typed in from NASA's fact sheets, so they're easy to check
// line by line:
//   Planets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
//   Moon:    https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
//   Pluto:   https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html
//   Moons and dwarf planets: https://ssd.jpl.nasa.gov/sats/phys_par/
//
//   node scripts/daily/build-space.mjs
// ============================================================

import { writeItems } from "./lib.mjs";

const SOURCE = "NASA (public domain)";
const FACT_SHEET = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/";
const JPL_MOONS = "https://ssd.jpl.nasa.gov/sats/phys_par/";

// fame: rough recognisability, used only to weight how often an item
// appears (planets most, small moons least)
const BODIES = [
  // id, name, emoji, detail, fame, source
  ["sun", "The Sun", "☀️", "Star", 100, FACT_SHEET],
  ["mercury", "Mercury", "🪐", "Planet", 90, FACT_SHEET],
  ["venus", "Venus", "🪐", "Planet", 90, FACT_SHEET],
  ["earth", "Earth", "🌍", "Planet", 100, FACT_SHEET],
  ["moon", "The Moon", "🌕", "Earth's moon", 95, FACT_SHEET],
  ["mars", "Mars", "🪐", "Planet", 95, FACT_SHEET],
  ["jupiter", "Jupiter", "🪐", "Planet", 95, FACT_SHEET],
  ["saturn", "Saturn", "🪐", "Planet", 95, FACT_SHEET],
  ["uranus", "Uranus", "🪐", "Planet", 85, FACT_SHEET],
  ["neptune", "Neptune", "🪐", "Planet", 85, FACT_SHEET],
  ["pluto", "Pluto", "🪐", "Dwarf planet", 85, FACT_SHEET],
  ["ceres", "Ceres", "🪨", "Dwarf planet", 40, JPL_MOONS],
  ["eris", "Eris", "🪨", "Dwarf planet", 35, JPL_MOONS],
  ["io", "Io", "🌑", "Moon of Jupiter", 50, JPL_MOONS],
  ["europa", "Europa", "🌑", "Moon of Jupiter", 60, JPL_MOONS],
  ["ganymede", "Ganymede", "🌑", "Moon of Jupiter", 55, JPL_MOONS],
  ["callisto", "Callisto", "🌑", "Moon of Jupiter", 45, JPL_MOONS],
  ["titan", "Titan", "🌑", "Moon of Saturn", 60, JPL_MOONS],
  ["enceladus", "Enceladus", "🌑", "Moon of Saturn", 40, JPL_MOONS],
  ["triton", "Triton", "🌑", "Moon of Neptune", 40, JPL_MOONS],
  ["charon", "Charon", "🌑", "Moon of Pluto", 35, JPL_MOONS],
  ["phobos", "Phobos", "🌑", "Moon of Mars", 40, JPL_MOONS],
];

const byId = new Map(BODIES.map(([id, name, emoji, detail, fame, source]) => [id, { id, name, emoji, detail, fame, source }]));

function category(id, values) {
  writeItems(
    id,
    Object.entries(values).map(([bodyId, value]) => ({ ...byId.get(bodyId), value })),
    SOURCE,
  );
}

// Mean diameter, km
category("space-diameter", {
  sun: 1392700,
  mercury: 4879,
  venus: 12104,
  earth: 12756,
  moon: 3475,
  mars: 6792,
  jupiter: 142984,
  saturn: 120536,
  uranus: 51118,
  neptune: 49528,
  pluto: 2376,
  ceres: 939,
  eris: 2326,
  io: 3643,
  europa: 3122,
  ganymede: 5268,
  callisto: 4821,
  titan: 5150,
  enceladus: 504,
  triton: 2707,
  charon: 1212,
  phobos: 22.5,
});

// Average distance from the Sun, million km
category("space-distance", {
  mercury: 57.9,
  venus: 108.2,
  earth: 149.6,
  mars: 228.0,
  ceres: 413.7,
  jupiter: 778.5,
  saturn: 1432.0,
  uranus: 2867.0,
  neptune: 4515.0,
  pluto: 5906.4,
  eris: 10180,
});

// Length of day (sunrise to sunrise), hours
category("space-day-length", {
  mercury: 4222.6,
  venus: 2802.0,
  earth: 24.0,
  moon: 708.7,
  mars: 24.7,
  jupiter: 9.9,
  saturn: 10.7,
  uranus: 17.2,
  neptune: 16.1,
  pluto: 153.3,
});

// Surface gravity, m/s²
category("space-gravity", {
  mercury: 3.7,
  venus: 8.9,
  earth: 9.8,
  moon: 1.6,
  mars: 3.7,
  jupiter: 23.1,
  saturn: 9.0,
  uranus: 8.7,
  neptune: 11.0,
  pluto: 0.7,
});

// Mean temperature, °C
category("space-temperature", {
  mercury: 167,
  venus: 464,
  earth: 15,
  moon: -20,
  mars: -65,
  jupiter: -110,
  saturn: -140,
  uranus: -195,
  neptune: -200,
  pluto: -225,
});

console.log("space categories written");
