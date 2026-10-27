// ============================================================
// ArcadeKit — Dogs Board (Rule Out)
// 24 cartoon dogs. AI-generated art owned by the site author
// (prompts in docs/PACK_ART_PROMPTS.md). Tags describe what each
// picture actually shows: "fluffy" means clearly fluffy or curly fur
// (Scout's shaggy westie coat doesn't count), "accessory" means a
// hat, glasses or a bandana (collars have their own question).
// ============================================================

import type { Board } from "./types.js";

function dog(id: string, name: string, tags: string[]) {
  return { id, name, image: `/boards/dogs/${id}.webp`, tags };
}

export const dogsBoard: Board = {
  id: "dogs",
  name: "Dogs",
  cards: [
    dog("bandit", "Bandit", ["color-white", "ears-up", "glasses", "accessory"]),
    dog("bear", "Bear", ["color-black", "bandana", "accessory"]),
    dog("biscuit", "Biscuit", ["color-brown", "tongue", "collar"]),
    dog("buddy", "Buddy", ["color-golden", "tongue"]),
    dog("coco", "Coco", ["color-brown", "tongue", "collar"]),
    dog("daisy", "Daisy", ["color-golden", "fluffy", "tongue", "bandana", "accessory"]),
    dog("duke", "Duke", ["color-black", "ears-up", "hat", "accessory"]),
    dog("ginger", "Ginger", ["color-ginger", "ears-up", "tongue", "bandana", "accessory"]),
    dog("lola", "Lola", ["color-black", "fluffy"]),
    dog("luna", "Luna", ["color-gray", "ears-up", "fluffy", "tongue"]),
    dog("maple", "Maple", ["color-white", "ears-up", "fluffy"]),
    dog("max", "Max", ["color-ginger", "tongue", "collar"]),
    dog("mochi", "Mochi", ["color-ginger", "ears-up", "collar"]),
    dog("ollie", "Ollie", ["color-black", "tongue", "collar"]),
    dog("otis", "Otis", ["color-brown", "collar", "hat", "accessory"]),
    dog("penny", "Penny", ["color-golden", "fluffy", "collar"]),
    dog("pepper", "Pepper", ["color-gray", "ears-up", "glasses", "accessory"]),
    dog("pickles", "Pickles", ["color-ginger", "ears-up", "fluffy", "hat", "accessory"]),
    dog("rocky", "Rocky", ["color-brown", "collar"]),
    dog("rosie", "Rosie", ["color-golden", "fluffy"]),
    dog("scout", "Scout", ["color-white", "ears-up", "collar"]),
    dog("tucker", "Tucker", ["color-gray", "collar", "glasses", "accessory"]),
    dog("waffles", "Waffles", ["color-white", "fluffy", "tongue"]),
    dog("ziggy", "Ziggy", ["color-gray", "tongue", "collar"]),
  ],
  questions: [
    { text: "Do its ears stand up?", tag: "ears-up" },
    { text: "Is it fluffy?", tag: "fluffy" },
    { text: "Is its tongue out?", tag: "tongue" },
    { text: "Is it wearing a collar?", tag: "collar" },
    { text: "Is it wearing a hat, glasses or a bandana?", tag: "accessory" },
    { text: "Is it wearing a hat?", tag: "hat" },
    { text: "Is it wearing glasses?", tag: "glasses" },
    { text: "Is it wearing a bandana?", tag: "bandana" },
    { text: "Is it mostly brown?", tag: "color-brown" },
    { text: "Is it mostly black?", tag: "color-black" },
    { text: "Is it mostly white?", tag: "color-white" },
    { text: "Is it golden?", tag: "color-golden" },
    { text: "Is it mostly gray?", tag: "color-gray" },
    { text: "Is it orange or red?", tag: "color-ginger" },
  ],
};
