// ============================================================
// ArcadeKit — Daily Rank: emoji display (browser)
// Windows has no flag emoji: 🇯🇵 shows as the letters "JP", which
// looks broken next to a country name. Hide flags there.
// ============================================================

const FLAG = /^\p{Regional_Indicator}{2}$/u;

export function displayEmoji(emoji: string | undefined): string | undefined {
  if (!emoji) return undefined;
  if (FLAG.test(emoji) && typeof navigator !== "undefined" && /Windows/.test(navigator.userAgent)) {
    return undefined;
  }
  return emoji;
}
