// ============================================================
// ArcadeKit — Classic Board (Rule Out)
// The default 24-card board. Portraits are AI-generated art owned
// by the site author; tags power the suggested questions.
// ============================================================

import type { Board } from "./types.js";

export const classicBoard: Board = {
  id: "classic",
  name: "Classic",
  cards: [
    {
      id: "alex",
      name: "Alex",
      image: "/boards/classic/alex.webp",
      tags: ["glasses", "smiling", "hair-brown", "hair-short", "eyes-brown"],
    },
    {
      id: "bella",
      name: "Bella",
      image: "/boards/classic/bella.webp",
      tags: ["smiling", "hair-blonde", "hair-long", "eyes-blue", "earrings", "accessory"],
    },
    {
      id: "carlos",
      name: "Carlos",
      image: "/boards/classic/carlos.webp",
      tags: ["facial-hair", "hat", "hair-black", "hair-short", "eyes-brown"],
    },
    {
      id: "diana",
      name: "Diana",
      image: "/boards/classic/diana.webp",
      tags: ["glasses", "smiling", "hair-red", "hair-medium", "eyes-green", "necklace", "accessory"],
    },
    {
      id: "ethan",
      name: "Ethan",
      image: "/boards/classic/ethan.webp",
      tags: ["facial-hair", "smiling", "hair-brown", "hair-medium", "eyes-blue", "bowtie", "accessory"],
    },
    {
      id: "fiona",
      name: "Fiona",
      image: "/boards/classic/fiona.webp",
      tags: ["hat", "hair-black", "hair-long", "eyes-brown", "earrings", "necklace", "accessory"],
    },
    {
      id: "george",
      name: "George",
      image: "/boards/classic/george.webp",
      tags: ["glasses", "facial-hair", "hair-gray", "hair-gray-white", "hair-short", "eyes-brown"],
    },
    {
      id: "hannah",
      name: "Hannah",
      image: "/boards/classic/hannah.webp",
      tags: ["smiling", "hair-brown", "hair-medium", "eyes-green", "headband", "accessory"],
    },
    {
      id: "ivan",
      name: "Ivan",
      image: "/boards/classic/ivan.webp",
      tags: ["hat", "smiling", "hair-blonde", "hair-short", "eyes-blue", "scarf", "accessory"],
    },
    {
      id: "jade",
      name: "Jade",
      image: "/boards/classic/jade.webp",
      tags: ["glasses", "hair-black", "hair-short", "eyes-brown"],
    },
    {
      id: "kevin",
      name: "Kevin",
      image: "/boards/classic/kevin.webp",
      tags: ["facial-hair", "hair-red", "hair-medium", "eyes-green"],
    },
    {
      id: "luna",
      name: "Luna",
      image: "/boards/classic/luna.webp",
      tags: ["smiling", "hair-white", "hair-gray-white", "hair-long", "eyes-blue", "earrings", "accessory"],
    },
    {
      id: "marco",
      name: "Marco",
      image: "/boards/classic/marco.webp",
      tags: ["glasses", "hat", "smiling", "hair-black", "hair-short", "eyes-brown", "bowtie", "accessory"],
    },
    {
      id: "nina",
      name: "Nina",
      image: "/boards/classic/nina.webp",
      tags: ["hat", "hair-red", "hair-medium", "eyes-brown", "scarf", "accessory"],
    },
    {
      id: "oscar",
      name: "Oscar",
      image: "/boards/classic/oscar.webp",
      tags: ["facial-hair", "hair-brown", "bald", "eyes-brown", "necklace", "accessory"],
    },
    {
      id: "penny",
      name: "Penny",
      image: "/boards/classic/penny.webp",
      tags: ["glasses", "smiling", "hair-blonde", "hair-short", "eyes-green"],
    },
    {
      id: "quinn",
      name: "Quinn",
      image: "/boards/classic/quinn.webp",
      tags: ["hat", "smiling", "hair-brown", "hair-medium", "eyes-blue"],
    },
    {
      id: "rosa",
      name: "Rosa",
      image: "/boards/classic/rosa.webp",
      tags: ["smiling", "hair-black", "hair-long", "eyes-brown", "necklace", "earrings", "accessory"],
    },
    {
      id: "sam",
      name: "Sam",
      image: "/boards/classic/sam.webp",
      tags: ["glasses", "facial-hair", "hair-blonde", "hair-short", "eyes-blue"],
    },
    {
      id: "tara",
      name: "Tara",
      image: "/boards/classic/tara.webp",
      tags: ["hat", "hair-gray", "hair-gray-white", "hair-medium", "eyes-green", "headband", "accessory"],
    },
    {
      id: "umar",
      name: "Umar",
      image: "/boards/classic/umar.webp",
      tags: ["facial-hair", "smiling", "hair-black", "hair-short", "eyes-brown", "scarf", "accessory"],
    },
    {
      id: "violet",
      name: "Violet",
      image: "/boards/classic/violet.webp",
      tags: ["glasses", "hair-brown", "hair-long", "eyes-blue", "earrings", "accessory"],
    },
    {
      id: "will",
      name: "Will",
      image: "/boards/classic/will.webp",
      tags: ["smiling", "hair-red", "bald", "eyes-green"],
    },
    {
      id: "xena",
      name: "Xena",
      image: "/boards/classic/xena.webp",
      tags: ["hat", "smiling", "hair-white", "hair-gray-white", "hair-short", "eyes-brown", "necklace", "accessory"],
    },
  ],
  questions: [
    { text: "Do they wear glasses?", tag: "glasses" },
    { text: "Do they have facial hair?", tag: "facial-hair" },
    { text: "Are they wearing a hat?", tag: "hat" },
    { text: "Are they smiling?", tag: "smiling" },
    { text: "Do they have black hair?", tag: "hair-black" },
    { text: "Do they have brown hair?", tag: "hair-brown" },
    { text: "Do they have blonde hair?", tag: "hair-blonde" },
    { text: "Do they have red hair?", tag: "hair-red" },
    { text: "Do they have gray or white hair?", tag: "hair-gray-white" },
    { text: "Do they have long hair?", tag: "hair-long" },
    { text: "Do they have short hair?", tag: "hair-short" },
    { text: "Are they bald?", tag: "bald" },
    { text: "Do they have blue eyes?", tag: "eyes-blue" },
    { text: "Do they have brown eyes?", tag: "eyes-brown" },
    { text: "Do they have green eyes?", tag: "eyes-green" },
    { text: "Do they wear earrings?", tag: "earrings" },
    { text: "Do they wear a necklace?", tag: "necklace" },
    { text: "Do they wear a bowtie?", tag: "bowtie" },
    { text: "Do they wear a scarf?", tag: "scarf" },
    { text: "Do they have any accessories?", tag: "accessory" },
  ],
};
