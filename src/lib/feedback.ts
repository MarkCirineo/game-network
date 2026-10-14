// ============================================================
// ArcadeKit — Feedback
// Shared shape and limits for the footer feedback form and its
// API route (POST /api/feedback → private Discord channel).
// ============================================================

export const FEEDBACK_TYPES = ["bug", "idea", "other"] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_LABELS: Record<FeedbackType, { emoji: string; label: string }> = {
  bug: { emoji: "🐛", label: "Bug" },
  idea: { emoji: "💡", label: "Idea" },
  other: { emoji: "💬", label: "Other" },
};

export const FEEDBACK_MAX_LENGTH = 1000;

/** Request body sent by the feedback dialog. */
export interface FeedbackPayload {
  type: FeedbackType;
  message: string;
  /** Page the form was opened from, e.g. "/room/ABCD" */
  path: string;
  /** Set only when the form is opened inside a game room */
  gameId?: string;
  roomCode?: string;
  /** Browser viewport, e.g. "390x844" */
  viewport: string;
  /** Honeypot — hidden from people, bots fill it in. Must be empty. */
  website?: string;
}

export function isFeedbackType(value: unknown): value is FeedbackType {
  return typeof value === "string" && (FEEDBACK_TYPES as readonly string[]).includes(value);
}
