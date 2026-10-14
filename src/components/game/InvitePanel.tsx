// ============================================================
// ArcadeKit — Invite Panel
// Room code display + copy code/link + native share for inviting players.
// ============================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Share2, Link } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface InvitePanelProps {
  roomCode: string;
  gameId: string;
  className?: string;
}

export function InvitePanel({ roomCode, gameId, className }: InvitePanelProps) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopy = useCallback(
    async (target: "code" | "link") => {
      try {
        await navigator.clipboard.writeText(
          target === "code" ? roomCode : window.location.href
        );
        setCopied(target);
        toast.success(target === "code" ? "Code copied!" : "Link copied!");
        trackEvent("invite-copy", { game: gameId, target });
        setTimeout(() => setCopied(null), 2000);
      } catch {
        toast.error(target === "code" ? "Failed to copy code" : "Failed to copy link");
      }
    },
    [roomCode, gameId]
  );

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: "Join my game on ArcadeKit!",
        text: `Join my game! Room code: ${roomCode}`,
        url: window.location.href,
      });
      trackEvent("invite-share", { game: gameId });
    } catch (err) {
      // User cancelled or share failed — silently ignore AbortError
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Sharing failed");
      }
    }
  }, [roomCode, gameId]);

  const codeChars = roomCode.split("");

  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-surface p-4",
        className
      )}
    >
      {/* Room code label + copy code */}
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Link className="h-3 w-3" />
          Room Code
        </span>
        <button
          onClick={() => handleCopy("code")}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 font-medium transition-colors",
            copied === "code"
              ? "text-cyan"
              : "text-text-secondary hover:bg-white/5 hover:text-foreground"
          )}
        >
          {copied === "code" ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied === "code" ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {/* Room code display — each character in its own box; click to copy */}
      <button
        onClick={() => handleCopy("code")}
        aria-label={`Copy room code ${roomCode}`}
        title="Copy code"
        className="mb-4 flex w-full cursor-pointer justify-center gap-1.5"
      >
        {codeChars.map((char, i) => (
          <span
            key={i}
            className={cn(
              "flex h-11 w-10 items-center justify-center rounded-lg border bg-elevated font-mono text-xl font-bold tracking-widest text-foreground transition-colors",
              copied === "code" ? "border-cyan/40" : "border-white/10"
            )}
          >
            {char}
          </span>
        ))}
      </button>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCopy("link")}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all active:translate-y-px",
            copied === "link"
              ? "bg-cyan/10 text-cyan"
              : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "transition-transform duration-200",
              copied === "link" && "scale-110"
            )}
          >
            {copied === "link" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </span>
          {copied === "link" ? "Copied!" : "Copy Link"}
        </button>

        {canShare && (
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-white/10 hover:text-foreground active:translate-y-px"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        )}
      </div>
    </div>
  );
}
