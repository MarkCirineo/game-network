// ============================================================
// ArcadeKit — Game Guide Content Types
// Typed structure for long-form "How to Play" guides.
// Each section maps to a rendered block and (where noted)
// a schema.org structured-data entity.
// ============================================================

/** One step in the rules walkthrough — maps to schema.org HowToStep. */
export interface HowToStep {
  name: string;
  text: string;
}

/** A named strategy tip. */
export interface StrategyTip {
  name: string;
  text: string;
}

/** A named game variation or house rule. */
export interface Variation {
  name: string;
  text: string;
}

/** FAQ entry — maps to schema.org Question/Answer. */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Affiliate product recommendation. Uses an Amazon search query
 * rather than a hard-coded ASIN so links never go stale.
 */
export interface GearItem {
  name: string;
  blurb: string;
  searchQuery: string;
}

/** Optional pointer to a related free tool on the site. */
export interface RelatedTool {
  slug: string;
  name: string;
  blurb: string;
}

export interface GameGuide {
  gameId: string;
  gameName: string;
  emoji: string;
  accentColor: string;

  /** SEO */
  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  /** ISO date shown as "Updated" and used for freshness signals */
  updated: string;

  /** Short line under the H1 */
  heroTagline: string;

  /** Rough play time in minutes, used for HowTo schema totalTime */
  totalTimeMinutes: number;

  intro: string[];
  history: string[];
  rules: {
    intro: string;
    steps: HowToStep[];
  };
  strategy: {
    intro: string;
    tips: StrategyTip[];
  };
  variations: {
    intro: string;
    items: Variation[];
  };
  faq: FaqItem[];
  gear: {
    intro: string;
    items: GearItem[];
  };
  relatedTool?: RelatedTool;
}
