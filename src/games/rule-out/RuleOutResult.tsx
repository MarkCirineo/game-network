'use client';

// ============================================================
// Rule Out — Game Over Reveal
// Shown on the game-over screen: both secret cards side by side.
// ============================================================

import Image from 'next/image';
import type { GameResultProps } from '@/games/types';
import type { RuleOutState } from './types';
import { cardById } from './logic';

export default function RuleOutResult({
  gameState,
  myPlayerId,
}: GameResultProps<RuleOutState>) {
  const s = gameState;
  if (!s?.result) return null;

  // Viewer's own card first; spectators see player order
  const order = s.players.includes(myPlayerId)
    ? [myPlayerId, s.players.find((p) => p !== myPlayerId)!]
    : [...s.players];

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      {order.map((pid) => {
        const card = cardById(s, s.secrets[pid]);
        const label = pid === myPlayerId ? 'Your card' : `${s.playerNames[pid] ?? 'Their'}'s card`;
        return (
          <div
            key={pid}
            className="flex flex-col items-center rounded-xl border border-white/5 bg-elevated/50 p-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              {label}
            </p>
            {card && (
              <>
                <div className="relative mt-2 aspect-square w-full max-w-28 overflow-hidden rounded-lg">
                  <Image src={card.image} alt="" fill sizes="112px" className="object-cover" />
                </div>
                <p className="mt-2 text-sm font-bold">{card.name}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
