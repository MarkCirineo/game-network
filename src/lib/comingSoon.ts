// ============================================================
// ArcadeKit — Coming-Soon Features
// Copy and parsing for /coming-soon?feature=<key>. The keys are a
// fixed contract: external sites link to these exact URLs.
// ============================================================

export const FEATURE_KEYS = ["custom-boards", "stats", "packs"] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export interface ComingSoonFeature {
  key: FeatureKey;
  /** Short name, used in headings and the "also planned" list */
  title: string;
  /** One-sentence description shown under the heading */
  summary: string;
  /** What the feature is planned to do — keep it honest, no promises */
  plans: string[];
}

export const FEATURES: Record<FeatureKey, ComingSoonFeature> = {
  "custom-boards": {
    key: "custom-boards",
    title: "Custom photo boards",
    summary:
      "Build a board for the game you came from using your own photos, then play it with a friend.",
    plans: [
      "Upload your own pictures to make a set of cards",
      "Share the board only with the people you play with",
    ],
  },
  stats: {
    key: "stats",
    title: "Saved stats and streaks",
    summary: "Keep a record of your wins, losses, and streaks across games.",
    plans: [
      "See your results over time instead of losing them when you close the tab",
      "Uses an optional account — every game stays playable without one",
    ],
  },
  packs: {
    key: "packs",
    title: "Themed board packs",
    summary:
      "New sets of cards with different themes for the game you came from.",
    plans: [
      "Pick a themed set of faces before the game starts",
      "More variety than playing the same board every time",
    ],
  },
};

/**
 * Features that have launched, and where their link now goes. The
 * page promises "this same link will take you straight to it", so a
 * launched key redirects instead of showing the coming-soon card.
 */
export const LIVE_FEATURE_PATHS: Partial<Record<FeatureKey, string>> = {
  packs: "/games/rule-out/packs",
};

/** Features still to come (launched ones drop out of the lists) */
export const PLANNED_FEATURE_KEYS: FeatureKey[] = FEATURE_KEYS.filter(
  (key) => !LIVE_FEATURE_PATHS[key],
);

export interface ParsedFeature {
  /** The matched feature, or null for a missing/unknown value */
  key: FeatureKey | null;
  /**
   * Value reported to analytics: the feature key, "none" when the
   * parameter is missing, or "unknown" otherwise. Raw input is never
   * reported, so arbitrary text can't end up in analytics.
   */
  tracked: string;
}

function isFeatureKey(value: string): value is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(value);
}

/** Normalize the `feature` search param (trimmed, lowercased, first value wins). */
export function parseFeature(raw: string | string[] | undefined): ParsedFeature {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  if (!value) return { key: null, tracked: "none" };
  if (isFeatureKey(value)) return { key: value, tracked: value };
  return { key: null, tracked: "unknown" };
}
