// ============================================================
// ArcadeKit — Room Page
// Client-side page that renders GameShell with the appropriate game.
// The URL itself (/room/ABCD) is the shareable invite link.
// ============================================================

"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { gameRegistry } from "@/games/registry";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ roomCode: string }>;
};

export default function RoomPage({ params }: Props) {
  const { roomCode } = use(params);
  const [roomInfo, setRoomInfo] = useState<{
    gameId: string;
    playerCount: number;
    maxPlayers: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoomInfo() {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Room not found. It may have expired.");
          } else {
            setError("Failed to load room information.");
          }
          return;
        }
        const data = await res.json();
        setRoomInfo(data);
      } catch {
        setError("Failed to connect. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchRoomInfo();
  }, [roomCode]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet" />
        <p className="mt-4 text-sm text-text-secondary">Loading room...</p>
      </div>
    );
  }

  // Error state
  if (error || !roomInfo) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <span className="text-4xl">😕</span>
        <h1 className="mt-4 font-heading text-xl font-bold">
          {error || "Room not found"}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          The room code <span className="font-mono font-bold">{roomCode}</span>{" "}
          doesn&apos;t exist or has expired.
        </p>
        <Link
          href="/games"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-violet px-6 text-sm font-medium text-white transition-all hover:bg-violet/90"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  // Look up the game
  const game = gameRegistry.byId(roomInfo.gameId);
  if (!game) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <span className="text-4xl">🎮</span>
        <h1 className="mt-4 font-heading text-xl font-bold">
          Unknown game type
        </h1>
        <Link
          href="/games"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-violet px-6 text-sm font-medium text-white transition-all hover:bg-violet/90"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <GameShell
      roomCode={roomCode}
      gameId={game.id}
      gameName={game.name}
      gameEmoji={game.emoji}
      accentColor={game.accentColor}
      minPlayers={game.minPlayers}
      maxPlayers={game.maxPlayers}
      GameComponent={game.component}
    />
  );
}
