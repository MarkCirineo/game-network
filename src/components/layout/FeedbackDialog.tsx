"use client";

// ============================================================
// ArcadeKit — Feedback Dialog
// Footer "Feedback" link that opens a small bug/idea form. No email
// or account: just a type, a message, and the page/game/screen size
// so bug reports are actionable. Sends to POST /api/feedback.
// ============================================================

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameStore } from "@/lib/stores/gameStore";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  FEEDBACK_LABELS,
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_TYPES,
  type FeedbackPayload,
  type FeedbackType,
} from "@/lib/feedback";

const PLACEHOLDERS: Record<FeedbackType, string> = {
  bug: "What happened? What did you expect to happen?",
  idea: "What would make ArcadeKit better for you?",
  other: "What's on your mind?",
};

interface FeedbackDialogProps {
  /** "link" for the footer, "button" for a prominent call to action */
  variant?: "link" | "button";
}

export function FeedbackDialog({ variant = "link" }: FeedbackDialogProps) {
  const pathname = usePathname();
  const storeGameId = useGameStore((s) => s.gameId);
  const storeRoomCode = useGameStore((s) => s.roomCode);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The game store keeps the last room after you leave it, so only
  // attach game details while actually on a room page.
  const inRoom = pathname.startsWith("/room/");
  const gameId = inRoom ? storeGameId ?? undefined : undefined;
  const roomCode = inRoom ? storeRoomCode ?? undefined : undefined;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setError(null);
      trackEvent("feedback-open", { game: gameId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    const payload: FeedbackPayload = {
      type,
      message: trimmed,
      path: pathname,
      gameId,
      roomCode,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      website,
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Couldn't send feedback. Please try again.");
        return;
      }
      trackEvent("feedback-submit", { type, game: gameId });
      toast.success("Thanks! Your feedback was sent.");
      setMessage("");
      setType("bug");
      setOpen(false);
    } catch {
      setError("Couldn't send feedback. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className={
          variant === "button"
            ? "inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-ember px-6 text-sm font-medium text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
            : "inline-flex cursor-pointer items-center gap-1 text-text-secondary transition-colors hover:text-ember"
        }
      >
        <MessageSquarePlus className={variant === "button" ? "h-4 w-4" : "h-3 w-3"} />
        {variant === "button" ? "Send feedback" : "Feedback"}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-surface sm:max-w-md">
          <DialogTitle className="font-heading text-lg">Send feedback</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Found a bug or have an idea for a game or feature? Let us know.
          </DialogDescription>

          <form onSubmit={handleSubmit} className="grid gap-3">
            {/* Type */}
            <div role="radiogroup" aria-label="Feedback type" className="grid grid-cols-3 gap-2">
              {FEEDBACK_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={type === t}
                  onClick={() => setType(t)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    type === t
                      ? "border-ember/60 bg-ember/10 text-text-primary"
                      : "border-white/5 bg-elevated text-text-secondary hover:border-white/15"
                  )}
                >
                  <span aria-hidden>{FEEDBACK_LABELS[t].emoji}</span> {FEEDBACK_LABELS[t].label}
                </button>
              ))}
            </div>

            {/* Message */}
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={PLACEHOLDERS[type]}
                aria-label="Your feedback"
                maxLength={FEEDBACK_MAX_LENGTH}
                rows={5}
                required
                className="w-full resize-none rounded-xl border border-white/5 bg-elevated px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-ember/50 focus:ring-1 focus:ring-ember/30"
              />
              <div className="mt-1 flex justify-between gap-2 text-[11px] text-text-muted">
                <span>Please don&apos;t include personal info.</span>
                <span>
                  {message.length}/{FEEDBACK_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Honeypot: off-screen, skipped by keyboard and screen readers */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="cursor-pointer rounded-xl bg-ember px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send feedback"}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-text-muted">
              Sent along with your message: this page{gameId ? ", the game and room code" : ""}, your
              browser, and your screen size, to help track down bugs.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
