// ============================================================
// ArcadeKit — Room Codes
// Shared between client and server so typed codes match the
// codes the server generates.
// ============================================================

/** Room code alphabet: excludes ambiguous characters (0, O, 1, I) */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 4;

/**
 * Turn whatever a player typed or pasted into a room code: accepts a
 * full invite link (…/room/ABCD), uppercases, drops characters that
 * can't appear in a code, and trims to the code length.
 */
export function normalizeRoomCode(input: string): string {
  const fromLink = input.match(/\/room\/([^/?#\s]+)/i);
  const raw = (fromLink ? fromLink[1] : input).toUpperCase();
  let code = '';
  for (const char of raw) {
    if (ROOM_CODE_ALPHABET.includes(char)) code += char;
    if (code.length === ROOM_CODE_LENGTH) break;
  }
  return code;
}

export function isCompleteRoomCode(code: string): boolean {
  return normalizeRoomCode(code) === code && code.length === ROOM_CODE_LENGTH;
}
