// ============================================================
// Rule Out — Board Picker (lobby)
// The host picks which board pack the room plays. Locked packs
// explain how to unlock them; those links open in a new tab so the
// host keeps the room, and the list refreshes when they come back.
// Signing in there ends on /signed-in rather than the room, so the
// host doesn't join their own room a second time.
// Joiners see the board the host has picked so far.
// ============================================================

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Layers, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openSignInTab, SIGN_IN_TAB_HREF } from '@/lib/signInTab';
import type { LobbyOptionsProps } from '@/games/types';
import { getBoard, DEFAULT_BOARD_ID } from '../../../shared/boards';
import { BOARD_PACKS } from '../../../shared/boards/packs';
import { PACKS_PATH, usePackStatuses, type PackWithStatus } from './packs';

function badge(pack: PackWithStatus | undefined): { text: string; tone: string } {
  if (!pack) return { text: '', tone: '' };
  if (pack.status === 'sign-in') return { text: 'Free with account', tone: 'text-cyan' };
  if (pack.status === 'buy') return { text: 'Locked', tone: 'text-text-muted' };
  if (pack.access === 'paid') return { text: 'Owned', tone: 'text-amber' };
  return { text: 'Free', tone: 'text-text-secondary' };
}

export default function BoardPicker({ isHost, options, onOptionsChange }: LobbyOptionsProps) {
  const statuses = usePackStatuses();
  const selectedId = typeof options.board === 'string' ? options.board : DEFAULT_BOARD_ID;
  const selected = statuses?.find((p) => p.id === selectedId);
  const selectedPack = BOARD_PACKS.find((p) => p.id === selectedId);

  return (
    <div className="rounded-xl border border-white/5 bg-surface p-4 xl:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Layers className="h-4 w-4" />
          <span>Board</span>
        </div>
        <Link
          href={PACKS_PATH}
          target="_blank"
          className="text-xs font-medium text-ember hover:text-ember/80"
        >
          About packs
        </Link>
      </div>

      {!isHost ? (
        <div className="flex items-center gap-3">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-elevated">
            <Image src={getBoard(selectedId).cards[0].image} alt="" fill sizes="56px" className="object-cover" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {selectedPack?.emoji} {selectedPack?.name ?? getBoard(selectedId).name}
            </p>
            <p className="text-xs text-text-secondary">
              The host picks the board. You don&apos;t need an account to play it.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BOARD_PACKS.map((pack) => {
              const status = statuses?.find((p) => p.id === pack.id);
              const isSelected = pack.id === selectedId;
              const locked = status ? status.status !== 'unlocked' : pack.access !== 'free';
              const { text, tone } = badge(status);
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => onOptionsChange({ ...options, board: pack.id })}
                  aria-pressed={isSelected}
                  className={cn(
                    'group flex cursor-pointer flex-col items-stretch gap-1.5 rounded-lg border p-2 text-left transition-colors',
                    isSelected
                      ? 'border-ember bg-ember/10 ring-2 ring-ember'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5',
                  )}
                >
                  <span className="relative aspect-square w-full overflow-hidden rounded-md bg-elevated">
                    <Image
                      src={getBoard(pack.id).cards[0].image}
                      alt=""
                      fill
                      sizes="120px"
                      className={cn('object-cover', locked && 'opacity-50')}
                    />
                    <span className="absolute left-1.5 top-1.5 text-lg leading-none">{pack.emoji}</span>
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ember text-white shadow-md ring-2 ring-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                    {locked && !isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                        <Lock className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">{pack.name}</span>
                  <span className={cn('h-4 text-xs', tone)}>{text}</span>
                </button>
              );
            })}
          </div>

          {selected?.status === 'sign-in' && (
            <p className="mt-3 rounded-lg bg-cyan/10 px-3 py-2 text-sm text-text-primary">
              {selected.name} is free with an account. Only you need one: your friends join
              without signing in.{' '}
              <Link
                href={SIGN_IN_TAB_HREF}
                target="_blank"
                onClick={(e) => {
                  if (openSignInTab()) e.preventDefault();
                }}
                className="font-semibold text-cyan hover:text-cyan/80"
              >
                Sign in or create an account
              </Link>
            </p>
          )}
          {selected?.status === 'buy' && (
            <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-text-primary">
              Unlock {selected.name} to play it here. Only the host needs it: everyone in your
              room plays it with you.{' '}
              <Link
                href={`${PACKS_PATH}#${selected.id}`}
                target="_blank"
                className="font-semibold text-ember hover:text-ember/80"
              >
                See the {selected.name} pack
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
