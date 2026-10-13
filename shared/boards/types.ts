// ============================================================
// ArcadeKit — Board Types (Rule Out)
// A board is plain data: a list of cards plus optional suggested
// questions. Built-in boards live in this folder; custom boards
// and packs can be loaded from elsewhere in the same shape.
// ============================================================

export interface BoardCard {
  /** Unique within the board */
  id: string;
  /** Name shown under the picture */
  name: string;
  /** Image URL (site-relative for built-in boards) */
  image: string;
  /**
   * Traits used by suggested questions (e.g. "glasses", "hair-red").
   * Optional — boards without tags simply get no suggestions.
   */
  tags?: string[];
}

/** A yes/no question that splits the board by one tag. */
export interface SuggestedQuestion {
  text: string;
  /** A card answers "yes" when its tags include this tag */
  tag: string;
}

export interface Board {
  id: string;
  name: string;
  cards: BoardCard[];
  questions?: SuggestedQuestion[];
}
