// ============================================================
// ArcadeKit — Fantasy Board (Rule Out)
// 24 fantasy characters. AI-generated art owned by the site author
// (prompts in docs/PACK_ART_PROMPTS.md). Tags describe what each
// picture actually shows: hair colors count a beard when the head
// is bald or covered, "head-covering" is a hat, hood or helmet
// (crowns have their own question; Elowen's hood is down), and the
// orcs' ears count as pointed.
// ============================================================

import type { Board } from "./types.js";

function hero(id: string, name: string, tags: string[]) {
  return { id, name, image: `/boards/fantasy/${id}.webp`, tags };
}

export const fantasyBoard: Board = {
  id: "fantasy",
  name: "Fantasy",
  cards: [
    hero("alaric", "Alaric", ["hair-white", "beard", "head-covering", "glasses", "open-smile"]),
    hero("brenna", "Brenna", ["hair-red", "armor"]),
    hero("cedric", "Cedric", ["hair-brown", "armor"]),
    hero("dwyn", "Dwyn", ["hair-red", "beard", "armor", "head-covering"]),
    hero("elowen", "Elowen", ["hair-blonde", "pointed-ears"]),
    hero("faelan", "Faelan", ["hair-black", "pointed-ears", "crown"]),
    hero("gorrin", "Gorrin", ["hair-black", "beard", "bald", "open-smile"]),
    hero("hilda", "Hilda", ["hair-white", "crown"]),
    hero("isolde", "Isolde", ["hair-black", "head-covering"]),
    hero("jorund", "Jorund", ["hair-blonde", "beard", "open-smile"]),
    hero("kade", "Kade", ["hair-brown", "head-covering", "open-smile"]),
    hero("lyra", "Lyra", ["hair-red", "head-covering", "open-smile"]),
    hero("mirren", "Mirren", ["hair-white", "pointed-ears", "glasses"]),
    hero("nyx", "Nyx", ["hair-black", "pointed-ears", "armor", "green-skin"]),
    hero("orrin", "Orrin", ["hair-white", "beard", "bald", "glasses"]),
    hero("pell", "Pell", ["hair-blonde", "armor", "head-covering", "open-smile"]),
    hero("quill", "Quill", ["hair-white", "beard", "pointed-ears", "head-covering", "glasses", "open-smile"]),
    hero("rowan", "Rowan", ["hair-brown", "beard", "head-covering"]),
    hero("sable", "Sable", ["hair-white", "pointed-ears", "crown"]),
    hero("thorne", "Thorne", ["bald", "pointed-ears", "armor", "green-skin"]),
    hero("ulric", "Ulric", ["hair-brown", "beard", "crown"]),
    hero("vesna", "Vesna", ["hair-red", "head-covering"]),
    hero("wren", "Wren", ["hair-blonde", "pointed-ears", "open-smile"]),
    hero("ysolde", "Ysolde", ["hair-black", "crown", "open-smile"]),
  ],
  questions: [
    { text: "Do they have a beard?", tag: "beard" },
    { text: "Do they have pointed ears?", tag: "pointed-ears" },
    { text: "Are they wearing armor?", tag: "armor" },
    { text: "Are they wearing a crown?", tag: "crown" },
    { text: "Are they wearing a hat, hood or helmet?", tag: "head-covering" },
    { text: "Do they wear glasses or goggles?", tag: "glasses" },
    { text: "Are they smiling with their mouth open?", tag: "open-smile" },
    { text: "Are they bald?", tag: "bald" },
    { text: "Do they have green skin?", tag: "green-skin" },
    { text: "Is their hair (or beard) red?", tag: "hair-red" },
    { text: "Is their hair (or beard) blonde?", tag: "hair-blonde" },
    { text: "Is their hair (or beard) brown?", tag: "hair-brown" },
    { text: "Is their hair (or beard) black?", tag: "hair-black" },
    { text: "Is their hair (or beard) white, gray or silver?", tag: "hair-white" },
  ],
};
