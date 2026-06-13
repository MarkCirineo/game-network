// ============================================================
// ArcadeKit — Game Options Schema
// Shared between client and server for configurable game settings.
// ============================================================

export interface GameOptionSchema {
  /** Unique key for this option */
  key: string;
  /** Human-readable label */
  label: string;
  /** Control type */
  type: 'select' | 'number';
  /** Available options for 'select' type */
  options?: { label: string; value: number | string }[];
  /** Min value for 'number' type */
  min?: number;
  /** Max value for 'number' type */
  max?: number;
  /** Default value */
  default: number | string;
}
