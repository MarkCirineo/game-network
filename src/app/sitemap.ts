// ============================================================
// ArcadeKit — Dynamic Sitemap
// Generates sitemap.xml with all public routes.
// ============================================================

import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games";

// All registered game IDs
const gameIds = [
  "tic-tac-toe",
  "rock-paper-scissors",
  "connect-four",
  "battleship",
  "word-scramble",
  "reaction-race",
];

// All tool slugs
const toolSlugs = [
  "dice-roller",
  "coin-flip",
  "chess-clock",
  "team-generator",
  "card-shuffler",
  "battleship-board",
  "spin-wheel",
  "score-keeper",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/games`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // Game detail pages
  const gamePages: MetadataRoute.Sitemap = gameIds.map((id) => ({
    url: `${BASE_URL}/games/${id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // How-to-play guides
  const guidePages: MetadataRoute.Sitemap = gameIds.map((id) => ({
    url: `${BASE_URL}/games/${id}/how-to-play`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Tool pages
  const toolPages: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...gamePages, ...guidePages, ...toolPages];
}
