// ============================================================
// ArcadeKit — Daily Rank: Animals (hand-entered, from Wikipedia)
// Familiar animals only. Animal numbers vary (males vs females,
// wild vs captive), so each value is a typical adult figure from the
// animal's Wikipedia article (linked), and the categories' gap rules
// keep animals with similar numbers out of the same round.
//
//   node scripts/daily/build-animals.mjs
// ============================================================

import { writeItems } from "./lib.mjs";

const wiki = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
const SOURCE = "Wikipedia";

// id: [name, emoji, Wikipedia title, fame (rough, 1–100)]
const ANIMALS = {
  "blue-whale": ["Blue whale", "🐋", "Blue whale", 90],
  elephant: ["African elephant", "🐘", "African bush elephant", 100],
  rhino: ["White rhinoceros", "🦏", "White rhinoceros", 75],
  hippo: ["Hippopotamus", "🦛", "Hippopotamus", 85],
  giraffe: ["Giraffe", "🦒", "Giraffe", 90],
  "white-shark": ["Great white shark", "🦈", "Great white shark", 85],
  bison: ["American bison", "🦬", "American bison", 70],
  horse: ["Horse", "🐎", "Horse", 95],
  cow: ["Cow", "🐄", "Cattle", 95],
  "polar-bear": ["Polar bear", "🐻‍❄️", "Polar bear", 90],
  grizzly: ["Grizzly bear", "🐻", "Grizzly bear", 80],
  tiger: ["Tiger", "🐅", "Tiger", 95],
  lion: ["Lion", "🦁", "Lion", 100],
  gorilla: ["Gorilla", "🦍", "Gorilla", 85],
  chimp: ["Chimpanzee", "🐒", "Chimpanzee", 80],
  ostrich: ["Ostrich", "🪶", "Common ostrich", 75],
  panda: ["Giant panda", "🐼", "Giant panda", 90],
  kangaroo: ["Red kangaroo", "🦘", "Red kangaroo", 85],
  cheetah: ["Cheetah", "🐆", "Cheetah", 90],
  wolf: ["Gray wolf", "🐺", "Wolf", 85],
  penguin: ["Emperor penguin", "🐧", "Emperor penguin", 85],
  koala: ["Koala", "🐨", "Koala", 80],
  cat: ["House cat", "🐈", "Cat", 100],
  dog: ["Dog", "🐕", "Dog", 100],
  human: ["Human", "🧑", "Pregnancy", 100],
  chicken: ["Chicken", "🐔", "Chicken", 90],
  pig: ["Pig", "🐖", "Pig", 90],
  sheep: ["Sheep", "🐑", "Sheep", 85],
  rabbit: ["Rabbit", "🐇", "Rabbit", 85],
  squirrel: ["Gray squirrel", "🐿️", "Eastern gray squirrel", 75],
  mouse: ["House mouse", "🐁", "House mouse", 85],
  hamster: ["Hamster", "🐹", "Golden hamster", 75],
  opossum: ["Opossum", undefined, "Virginia opossum", 60],
  hummingbird: ["Hummingbird", "🐦", "Ruby-throated hummingbird", 75],
  falcon: ["Peregrine falcon", "🦅", "Peregrine falcon", 70],
  pronghorn: ["Pronghorn", "🦌", "Pronghorn", 55],
  sloth: ["Three-toed sloth", "🦥", "Three-toed sloth", 80],
  snail: ["Garden snail", "🐌", "Cornu aspersum", 70],
  bolt: ["Usain Bolt", "🏃", "Usain Bolt", 90],
};

function category(id, values, details = {}) {
  writeItems(
    id,
    Object.entries(values).map(([animalId, value]) => {
      const [name, emoji, title, fame] = ANIMALS[animalId];
      return { id: animalId, name, emoji, detail: details[animalId], value, fame, source: wiki(title) };
    }),
    SOURCE,
  );
}

// Typical adult weight, kg
category("animal-weight", {
  "blue-whale": 150000,
  elephant: 6000,
  rhino: 2300,
  hippo: 1500,
  giraffe: 1200,
  "white-shark": 1100,
  bison: 700,
  horse: 500,
  "polar-bear": 450,
  tiger: 220,
  lion: 190,
  gorilla: 160,
  ostrich: 110,
  panda: 100,
  kangaroo: 66,
  cheetah: 50,
  wolf: 40,
  penguin: 30,
  koala: 9,
  cat: 4.5,
  chicken: 2.5,
  squirrel: 0.5,
  mouse: 0.02,
  hummingbird: 0.0035,
});

// Top speed, km/h
category(
  "animal-speed",
  {
    falcon: 320,
    cheetah: 100,
    pronghorn: 88,
    lion: 80,
    horse: 70,
    giraffe: 60,
    grizzly: 56,
    cat: 48,
    bolt: 45,
    elephant: 40,
    hippo: 30,
    chicken: 14,
    sloth: 0.27,
    snail: 0.05,
  },
  { falcon: "In a dive", bolt: "Fastest human ever timed" },
);

// Length of pregnancy, days
category("animal-pregnancy", {
  elephant: 645,
  rhino: 490,
  giraffe: 460,
  horse: 340,
  cow: 283,
  human: 280,
  gorilla: 255,
  hippo: 240,
  chimp: 230,
  sheep: 152,
  pig: 114,
  lion: 110,
  tiger: 103,
  cat: 65,
  dog: 63,
  kangaroo: 33,
  rabbit: 31,
  mouse: 20,
  hamster: 16,
  opossum: 13,
});

console.log("animal categories written");
