// ============================================================
// ArcadeKit — Create Room Button (Client Component)
// Handles room creation and client-side navigation.
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

interface CreateRoomButtonProps {
  gameId: string;
  accentColor: string;
}

export function CreateRoomButton({ gameId, accentColor }: CreateRoomButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Try the Next.js API proxy first
      let data: { roomCode: string } | null = null;

      try {
        const res = await fetch("/api/rooms/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // API proxy failed, fall through
      }

      // Fallback: call game server directly
      if (!data) {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
        const httpUrl = wsUrl.replace(/^ws/, "http");
        
        const res = await fetch(`${httpUrl}/create-room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId }),
        });

        if (!res.ok) {
          throw new Error("Failed to create room");
        }
        data = await res.json();
      }

      if (data?.roomCode) {
        router.push(`/room/${data.roomCode}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleCreateRoom}
        disabled={isCreating}
        className="inline-flex h-12 items-center gap-2 rounded-xl px-8 text-base font-semibold text-white transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 0 20px ${accentColor}33`,
        }}
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Room…
          </>
        ) : (
          <>
            Create Room
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
