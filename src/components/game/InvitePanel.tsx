// ============================================================
// ArcadeKit — Invite Panel
// Room code display + copy link + native share for inviting players.
// ============================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Share2, Link } from "lucide-react";
import { toast } from "sonner";

interface InvitePanelProps {
  roomCode: string;
  className?: string;
}

export function InvitePanel({ roomCode, className }: InvitePanelProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: "Join my game on ArcadeKit!",
        text: `Join my game! Room code: ${roomCode}`,
        url: window.location.href,
      });
    } catch (err) {
      // User cancelled or share failed — silently ignore AbortError
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Sharing failed");
      }
    }
  }, [roomCode]);

  const codeChars = roomCode.split("");

  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-surface p-4",
        className
      )}
    >
      {/* Room code label */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-text-muted">
        <Link className="h-3 w-3" />
        Room Code
      </div>

      {/* Room code display — each character in its own box */}
      <div className="mb-4 flex justify-center gap-1.5">
        {codeChars.map((char, i) => (
          <div
            key={i}
            className="flex h-11 w-10 items-center justify-center rounded-lg border border-white/10 bg-elevated font-mono text-xl font-bold tracking-widest text-foreground"
          >
            {char}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all active:translate-y-px",
            copied
              ? "bg-cyan/10 text-cyan"
              : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "transition-transform duration-200",
              copied && "scale-110"
            )}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </span>
          {copied ? "Copied!" : "Copy Link"}
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
