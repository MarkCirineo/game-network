// ============================================================
// ArcadeKit — Monster Mash Board (Rule Out)
// 24 friendly monsters. AI-generated art owned by the site author
// (prompts in docs/PACK_ART_PROMPTS.md). Tags describe what each
// picture actually shows, so the suggested questions answer right:
// "wearing" covers clothes and accessories, "fangs" means pointy
// fangs (Gloop's flat teeth don't count).
// ============================================================

import type { Board } from "./types.js";

function monster(id: string, name: string, tags: string[]) {
  return { id, name, image: `/boards/monster-mash/${id}.webp`, tags };
}

export const monsterMashBoard: Board = {
  id: "monster-mash",
  name: "Monster Mash",
  cards: [
    monster("bix", "Bix", ["color-blue", "eyes-two", "fangs", "spots", "hat", "wearing"]),
    monster("boris", "Boris", ["color-purple", "eyes-two", "horns", "fangs", "wearing"]),
    monster("bramble", "Bramble", ["color-green", "eyes-two", "horns", "fangs", "fuzzy", "wearing"]),
    monster("doodle", "Doodle", ["color-pink", "eyes-two", "fangs", "fuzzy"]),
    monster("fang", "Fang", ["color-blue", "eyes-one", "horns", "fangs"]),
    monster("fizz", "Fizz", ["color-yellow", "eyes-one", "fangs", "hat", "wearing"]),
    monster("gloop", "Gloop", ["color-orange", "eyes-three", "spots"]),
    monster("grub", "Grub", ["color-green", "eyes-two", "fangs", "spots", "antennae"]),
    monster("gubbo", "Gubbo", ["color-green", "eyes-two", "horns", "fuzzy"]),
    monster("hex", "Hex", ["color-yellow", "eyes-three", "horns", "fangs", "wearing"]),
    monster("kip", "Kip", ["color-orange", "eyes-one", "horns", "spots", "antennae", "hat", "wearing"]),
    monster("lumpy", "Lumpy", ["color-orange", "eyes-three", "horns", "spots"]),
    monster("mabel", "Mabel", ["color-orange", "eyes-one", "fuzzy", "antennae", "wearing"]),
    monster("mona", "Mona", ["color-pink", "eyes-three", "fuzzy", "antennae", "wearing"]),
    monster("moxie", "Moxie", ["color-yellow", "eyes-two", "horns", "spots", "wearing"]),
    monster("nib", "Nib", ["color-blue", "eyes-two", "antennae", "wearing"]),
    monster("ozzy", "Ozzy", ["color-pink", "eyes-one", "horns", "spots", "wearing"]),
    monster("pip", "Pip", ["color-pink", "eyes-two", "horns", "spots"]),
    monster("razz", "Razz", ["color-purple", "eyes-two", "spots", "antennae", "wearing"]),
    monster("snork", "Snork", ["color-green", "eyes-two", "fangs", "fuzzy"]),
    monster("squib", "Squib", ["color-purple", "eyes-three", "fangs", "spots", "wearing"]),
    monster("tully", "Tully", ["color-blue", "eyes-three", "fuzzy", "wearing"]),
    monster("wanda", "Wanda", ["color-yellow", "eyes-two", "horns", "fuzzy", "wearing"]),
    monster("wisp", "Wisp", ["color-purple", "eyes-one", "antennae"]),
  ],
  questions: [
    { text: "Does it have just one eye?", tag: "eyes-one" },
    { text: "Does it have two eyes?", tag: "eyes-two" },
    { text: "Does it have three eyes?", tag: "eyes-three" },
    { text: "Does it have horns?", tag: "horns" },
    { text: "Does it have pointy fangs?", tag: "fangs" },
    { text: "Is it furry?", tag: "fuzzy" },
    { text: "Does it have spots?", tag: "spots" },
    { text: "Does it have antennae?", tag: "antennae" },
    { text: "Is it wearing clothes or an accessory?", tag: "wearing" },
    { text: "Is it wearing a hat?", tag: "hat" },
    { text: "Is it purple?", tag: "color-purple" },
    { text: "Is it pink?", tag: "color-pink" },
    { text: "Is it green?", tag: "color-green" },
    { text: "Is it blue?", tag: "color-blue" },
    { text: "Is it yellow?", tag: "color-yellow" },
    { text: "Is it orange?", tag: "color-orange" },
  ],
};
