// ============================================================
// ArcadeKit — Daily Rank: famous people by year born
// Typed in by hand (Wikidata's query service times out on people).
// Each year is from the person's Wikipedia article (linked).
// Negative years are BC; ancient ones are the usual estimates, and
// the category's gap rule keeps close ones apart.
//
//   node scripts/daily/build-people.mjs
// ============================================================

import { writeItems } from "./lib.mjs";

const wiki = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;

// [name, known for, year born, fame (rough, 1–100), Wikipedia title]
const PEOPLE = [
  ["Confucius", "Philosopher", -551, 75, "Confucius"],
  ["Socrates", "Philosopher", -470, 80, "Socrates"],
  ["Aristotle", "Philosopher", -384, 85, "Aristotle"],
  ["Alexander the Great", "King of Macedon", -356, 90, "Alexander the Great"],
  ["Julius Caesar", "Roman general", -100, 95, "Julius Caesar"],
  ["Cleopatra", "Queen of Egypt", -69, 90, "Cleopatra"],
  ["Genghis Khan", "Mongol ruler", 1162, 85, "Genghis Khan"],
  ["Marco Polo", "Explorer", 1254, 75, "Marco Polo"],
  ["Joan of Arc", "French heroine", 1412, 75, "Joan of Arc"],
  ["Christopher Columbus", "Explorer", 1451, 90, "Christopher Columbus"],
  ["Leonardo da Vinci", "Artist and inventor", 1452, 100, "Leonardo da Vinci"],
  ["Michelangelo", "Artist", 1475, 85, "Michelangelo"],
  ["William Shakespeare", "Playwright", 1564, 100, "William Shakespeare"],
  ["Isaac Newton", "Scientist", 1643, 95, "Isaac Newton"],
  ["Johann Sebastian Bach", "Composer", 1685, 80, "Johann Sebastian Bach"],
  ["Benjamin Franklin", "Inventor and statesman", 1706, 85, "Benjamin Franklin"],
  ["George Washington", "1st US president", 1732, 95, "George Washington"],
  ["Wolfgang Amadeus Mozart", "Composer", 1756, 95, "Wolfgang Amadeus Mozart"],
  ["Napoleon Bonaparte", "French emperor", 1769, 95, "Napoleon"],
  ["Ludwig van Beethoven", "Composer", 1770, 90, "Ludwig van Beethoven"],
  ["Jane Austen", "Novelist", 1775, 80, "Jane Austen"],
  ["Abraham Lincoln", "16th US president", 1809, 95, "Abraham Lincoln"],
  ["Karl Marx", "Philosopher", 1818, 80, "Karl Marx"],
  ["Queen Victoria", "Queen of the UK", 1819, 85, "Queen Victoria"],
  ["Florence Nightingale", "Nurse", 1820, 70, "Florence Nightingale"],
  ["Thomas Edison", "Inventor", 1847, 90, "Thomas Edison"],
  ["Vincent van Gogh", "Painter", 1853, 90, "Vincent van Gogh"],
  ["Nikola Tesla", "Inventor", 1856, 85, "Nikola Tesla"],
  ["Marie Curie", "Scientist", 1867, 85, "Marie Curie"],
  ["Mahatma Gandhi", "Independence leader", 1869, 90, "Mahatma Gandhi"],
  ["Winston Churchill", "UK prime minister", 1874, 90, "Winston Churchill"],
  ["Albert Einstein", "Physicist", 1879, 100, "Albert Einstein"],
  ["Pablo Picasso", "Painter", 1881, 85, "Pablo Picasso"],
  ["Charlie Chaplin", "Actor and filmmaker", 1889, 80, "Charlie Chaplin"],
  ["Walt Disney", "Animator", 1901, 85, "Walt Disney"],
  ["Frida Kahlo", "Painter", 1907, 75, "Frida Kahlo"],
  ["John F. Kennedy", "35th US president", 1917, 85, "John F. Kennedy"],
  ["Nelson Mandela", "President of South Africa", 1918, 90, "Nelson Mandela"],
  ["Marilyn Monroe", "Actress", 1926, 80, "Marilyn Monroe"],
  ["Martin Luther King Jr.", "Civil rights leader", 1929, 90, "Martin Luther King Jr."],
  ["Neil Armstrong", "Astronaut", 1930, 80, "Neil Armstrong"],
  ["Elvis Presley", "Singer", 1935, 85, "Elvis Presley"],
  ["John Lennon", "Musician", 1940, 80, "John Lennon"],
  ["Muhammad Ali", "Boxer", 1942, 80, "Muhammad Ali"],
  ["Bob Marley", "Musician", 1945, 75, "Bob Marley"],
  ["Freddie Mercury", "Singer", 1946, 75, "Freddie Mercury"],
  ["Steve Jobs", "Apple co-founder", 1955, 85, "Steve Jobs"],
  ["Michael Jackson", "Singer", 1958, 90, "Michael Jackson"],
  ["Princess Diana", "Princess of Wales", 1961, 80, "Diana, Princess of Wales"],
];

writeItems(
  "people",
  PEOPLE.map(([name, detail, value, fame, title]) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    detail,
    value,
    fame,
    source: wiki(title),
  })),
  "Wikipedia",
);

console.log(`${PEOPLE.length} people written`);
