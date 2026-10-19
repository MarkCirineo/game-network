// ============================================================
// ArcadeKit — Daily Rank: Food categories (USDA, public domain)
// Calories, protein, and sugar per 100 g for everyday foods, from
// USDA FoodData Central's "SR Legacy" table (the standard reference
// numbers). Each food names its exact USDA entry (the script stops if
// one isn't found), so every food is measured the same way.
//
//   node --env-file=.env.local scripts/daily/fetch-usda.mjs
//
// Needs USDA_API_KEY (free from api.data.gov). Prints each food's
// numbers for review.
// ============================================================

import { writeItems, sleep } from "./lib.mjs";

const KEY = process.env.USDA_API_KEY;
if (!KEY) {
  console.error("Set USDA_API_KEY (free key from https://api.data.gov/signup/)");
  process.exit(1);
}

const SOURCE = "USDA FoodData Central";
const fdcUrl = (id) => `https://fdc.nal.usda.gov/food-details/${id}/nutrients`;

// [id, name, emoji, detail, exact USDA description, fame (rough, 1–100)]
const FOODS = [
  ["apple", "Apple", "🍎", "Raw", "Apples, raw, with skin (Includes foods for USDA's Food Distribution Program)", 95],
  ["banana", "Banana", "🍌", "Raw", "Bananas, raw", 95],
  ["orange", "Orange", "🍊", "Raw", "Oranges, raw, all commercial varieties", 90],
  ["strawberries", "Strawberries", "🍓", "Raw", "Strawberries, raw", 90],
  ["watermelon", "Watermelon", "🍉", "Raw", "Watermelon, raw", 90],
  ["grapes", "Grapes", "🍇", "Raw", "Grapes, red or green (European type, such as Thompson seedless), raw", 85],
  ["avocado", "Avocado", "🥑", "Raw", "Avocados, raw, all commercial varieties", 85],
  ["raisins", "Raisins", "🍇", "Dried grapes", "Raisins, dark, seedless (Includes foods for USDA's Food Distribution Program)", 75],
  ["broccoli", "Broccoli", "🥦", "Raw", "Broccoli, raw", 90],
  ["carrot", "Carrot", "🥕", "Raw", "Carrots, raw", 90],
  ["cucumber", "Cucumber", "🥒", "Raw, with peel", "Cucumber, with peel, raw", 80],
  ["lettuce", "Iceberg lettuce", "🥬", "Raw", "Lettuce, iceberg (includes crisphead types), raw", 80],
  ["potato", "Baked potato", "🥔", "With skin", "Potatoes, baked, flesh and skin, without salt", 85],
  ["fries", "French fries", "🍟", "Oven-baked frozen fries", "Potatoes, french fried, crinkle or regular cut, salt added in processing, frozen, oven-heated", 90],
  ["rice", "White rice", "🍚", "Cooked", "Rice, white, long-grain, regular, enriched, cooked", 90],
  ["pasta", "Pasta", "🍝", "Cooked", "Pasta, cooked, enriched, without added salt", 90],
  ["bread", "White bread", "🍞", "", "Bread, white, commercially prepared (includes soft bread crumbs)", 90],
  ["oatmeal", "Oatmeal", "🥣", "Cooked with water", "Cereals, oats, regular and quick, unenriched, cooked with water (includes boiling and microwaving), without salt", 75],
  ["egg", "Egg", "🥚", "Hard-boiled", "Egg, whole, cooked, hard-boiled", 95],
  ["chicken", "Chicken breast", "🍗", "Roasted, no skin", "Chicken, broilers or fryers, breast, meat only, cooked, roasted", 90],
  ["bacon", "Bacon", "🥓", "Pan-fried", "Pork, cured, bacon, pre-sliced, cooked, pan-fried", 90],
  ["ground-beef", "Ground beef", "🥩", "80% lean, cooked", "Beef, ground, 80% lean meat / 20% fat, patty, cooked, broiled", 85],
  ["salmon", "Salmon", "🐟", "Cooked", "Fish, salmon, Atlantic, farmed, cooked, dry heat", 85],
  ["tuna", "Canned tuna", "🐟", "In water, drained", "Fish, tuna, light, canned in water, drained solids (Includes foods for USDA's Food Distribution Program)", 80],
  ["shrimp", "Shrimp", "🦐", "Cooked", "Crustaceans, shrimp, cooked", 80],
  ["tofu", "Tofu", "🧈", "Firm", "Tofu, raw, firm, prepared with calcium sulfate", 70],
  ["lentils", "Lentils", "🫘", "Boiled", "Lentils, mature seeds, cooked, boiled, without salt", 70],
  ["cheddar", "Cheddar cheese", "🧀", "Sharp", "Cheese, cheddar, sharp, sliced", 90],
  ["butter", "Butter", "🧈", "Salted", "Butter, salted", 90],
  ["olive-oil", "Olive oil", "🫒", "", "Oil, olive, salad or cooking", 85],
  ["peanut-butter", "Peanut butter", "🥜", "Smooth", "Peanut butter, smooth style, without salt", 90],
  ["almonds", "Almonds", "🌰", "", "Nuts, almonds", 85],
  ["milk", "Whole milk", "🥛", "", "Milk, whole, 3.25% milkfat, with added vitamin D", 95],
  ["ice-cream", "Vanilla ice cream", "🍨", "", "Ice creams, vanilla", 90],
  ["honey", "Honey", "🍯", "", "Honey", 85],
  ["sugar", "Sugar", "🧂", "White, granulated", "Sugars, granulated", 85],
  ["chocolate", "Milk chocolate", "🍫", "", "Candies, milk chocolate", 95],
  ["chips", "Potato chips", "🥔", "Plain, salted", "Snacks, potato chips, plain, salted", 90],
  ["popcorn", "Popcorn", "🍿", "Air-popped", "Snacks, popcorn, air-popped", 85],
  ["donut", "Donut", "🍩", "Plain cake donut", "Doughnuts, cake-type, plain (includes unsugared, old-fashioned)", 90],
  ["pizza", "Cheese pizza", "🍕", "Frozen, baked", "Pizza, cheese topping, regular crust, frozen, cooked", 95],
  ["ketchup", "Ketchup", "🍅", "", "Catsup", 85],
  ["cola", "Cola", "🥤", "Regular", "Beverages, carbonated, cola, regular", 90],
  ["orange-juice", "Orange juice", "🧃", "Fresh", "Orange juice, raw (Includes foods for USDA's Food Distribution Program)", 85],
];

const NUTRIENTS = { calories: "208", protein: "203", sugar: "269" };

async function lookUp(description) {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.search = new URLSearchParams({
    api_key: KEY,
    // The search syntax chokes on brackets, quotes, and slashes
    query: description.replace(/[()'"/%]/g, " "),
    dataType: "SR Legacy",
    pageSize: "50",
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA search failed (${res.status}) for ${description}`);
  const { foods } = await res.json();
  const food = foods.find((f) => f.description.toLowerCase() === description.toLowerCase());
  if (!food) throw new Error(`No exact USDA entry for "${description}"; closest: ${foods[0]?.description}`);
  return food;
}

const rows = [];
for (const [id, name, emoji, detail, description, fame] of FOODS) {
  const food = await lookUp(description);
  const value = (number) => food.foodNutrients.find((n) => n.nutrientNumber === number)?.value;
  const row = {
    id,
    name,
    emoji,
    detail: detail || undefined,
    fame,
    source: fdcUrl(food.fdcId),
    calories: value(NUTRIENTS.calories),
    protein: value(NUTRIENTS.protein),
    sugar: value(NUTRIENTS.sugar),
  };
  rows.push(row);
  console.log(
    `${name.padEnd(18)} ${String(row.calories).padStart(4)} kcal  ${String(row.protein).padStart(5)} g protein  ${String(row.sugar).padStart(5)} g sugar  ← ${food.description}`,
  );
  await sleep(100);
}

const category = (id, key, min) =>
  writeItems(
    id,
    rows
      .filter((row) => typeof row[key] === "number" && row[key] >= min)
      .map(({ calories, protein, sugar, ...item }) => ({ ...item, value: { calories, protein, sugar }[key] })),
    SOURCE,
  );

category("food-calories", "calories", 1);
// Foods with next to no protein or sugar make a boring bottom slot
category("food-protein", "protein", 0.5);
category("food-sugar", "sugar", 0.5);
