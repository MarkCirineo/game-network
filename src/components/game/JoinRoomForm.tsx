// ============================================================
// ArcadeKit — Join Room Form (Client Component)
// Lets a player join a friend's room by typing its code.
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { fetchRoomInfo } from "@/lib/rooms";
import { ROOM_CODE_LENGTH, normalizeRoomCode } from "../../../shared/roomCode";

interface JoinRoomFormProps {
  /** The game page this form sits on; omit on non-game pages */
  gameId?: string;
  accentColor?: string;
  /** Show the code field right away, with no open/close toggle */
  alwaysOpen?: boolean;
}

export function JoinRoomForm({
  gameId,
  accentColor = "var(--color-ember)",
  alwaysOpen = false,
}: JoinRoomFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete = code.length === ROOM_CODE_LENGTH;
  const location = gameId ? "game-page" : "home";

  const close = () => {
    setIsOpen(false);
    setCode("");
    setError(null);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isJoining) return;

    setIsJoining(true);
    setError(null);

    try {
      // Check the room exists so a typo gets an inline error
      // instead of a dead room page
      await fetchRoomInfo(code);
      trackEvent("join-room-by-code", { location, game: gameId, result: "found" });
      router.push(`/room/${code}`);
    } catch (err) {
      const notFound = err instanceof Error && err.message === "Room not found";
      trackEvent("join-room-by-code", {
        location,
        game: gameId,
        result: notFound ? "not-found" : "error",
      });
      setError(
        notFound
          ? "No room with that code. Check it and try again."
          : "Couldn't reach the game server. Try again."
      );
      setIsJoining(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-base font-semibold text-foreground transition-all hover:bg-white/10 active:scale-[0.98]"
      >
        <KeyRound className="h-4 w-4" />
        Join with Code
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <form onSubmit={handleJoin} className="flex h-12 items-stretch gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(normalizeRoomCode(e.target.value));
            setError(null);
          }}
          onKeyDown={(e) => !alwaysOpen && e.key === "Escape" && close()}
          placeholder="CODE"
          aria-label="Room code"
          // Only focus when the player asked to join; on the homepage it
          // would steal focus and pop up the phone keyboard on load
          autoFocus={!alwaysOpen}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="w-32 rounded-xl border border-white/10 bg-elevated text-center font-mono text-xl font-bold tracking-[0.3em] text-foreground uppercase placeholder:text-text-muted placeholder:tracking-[0.2em] focus:border-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!isComplete || isJoining}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 text-base font-semibold text-white transition-all hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
        >
          {isJoining ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Join
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        {!alwaysOpen && (
          <button
            type="button"
            onClick={close}
            aria-label="Cancel joining"
            className="inline-flex w-12 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-text-secondary transition-all hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
