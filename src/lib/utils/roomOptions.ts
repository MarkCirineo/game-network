// ============================================================
// ArcadeKit — Preset Room Options
// Lets a page that creates a room hand the host's lobby a starting
// choice (e.g. "Play this pack" picks that board), without putting
// it in the invite link. Per-tab sessionStorage, keyed by room.
// ============================================================

function key(roomCode: string): string {
  return `arcadekit_options_${roomCode.toUpperCase()}`;
}

export function saveRoomOptions(roomCode: string, options: Record<string, unknown>): void {
  try {
    sessionStorage.setItem(key(roomCode), JSON.stringify(options));
  } catch {
    // storage blocked: the lobby just starts on the defaults
  }
}

export function readRoomOptions(roomCode: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(key(roomCode)) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
