// ============================================================
// Rule Out — Board Packs (client)
// Loading pack statuses for the lobby and the packs page, and the
// pre-start step that fetches a pack pass for the host.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { listenForSignIn } from '@/lib/signInTab';
import { getPack, type BoardPack } from '../../../shared/boards/packs';

export type PackStatus = 'unlocked' | 'sign-in' | 'buy';

export interface PackWithStatus extends BoardPack {
  status: PackStatus;
  owned: boolean;
}

/** Path of the packs page */
export const PACKS_PATH = '/games/rule-out/packs';

/**
 * Pack statuses for this browser's account (or signed out). Reloads
 * when the tab regains focus or another tab finishes signing in, so
 * signing in or buying in another tab shows up without a refresh.
 */
export function usePackStatuses(): PackWithStatus[] | null {
  const [packs, setPacks] = useState<PackWithStatus[] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/packs', { cache: 'no-store' });
      if (res.ok) setPacks((await res.json()).packs);
    } catch {
      // keep what we had; the start step re-checks anyway
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    load();
    window.addEventListener('focus', load);
    const stopListening = listenForSignIn(load);
    return () => {
      window.removeEventListener('focus', load);
      stopListening();
    };
  }, [load]);

  return packs;
}

/**
 * Before the host starts: packs beyond the free ones need a pass the
 * site signs for this room. Throws with a message for the host.
 */
export async function prepareRuleOutStart(
  options: Record<string, unknown>,
  roomCode: string,
): Promise<Record<string, unknown>> {
  const pack = getPack(options.board);
  if (!pack || pack.access === 'free') return options;

  let data: { pass?: string; error?: string } = {};
  try {
    const res = await fetch('/api/packs/pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board: pack.id, roomCode }),
    });
    data = await res.json();
  } catch {
    throw new Error(`Couldn't start the ${pack.name} pack. Check your connection and try again.`);
  }
  if (!data.pass) throw new Error(data.error ?? `Couldn't start the ${pack.name} pack.`);
  return { ...options, boardPass: data.pass };
}
