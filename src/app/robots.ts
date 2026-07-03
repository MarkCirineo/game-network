// ============================================================
// ArcadeKit — Robots.txt
// Allows all crawlers on public pages, blocks /room/ and /api/.
// ============================================================

import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arcadekit.games";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/room/", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
