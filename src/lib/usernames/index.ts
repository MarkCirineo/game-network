// ============================================================
// ArcadeKit — Usernames (shared by server and client)
// Every account has a public username: the only name other players
// see. Real names and photos are never stored. Sign-in is by email,
// never by username.
// ============================================================

import { BLOCKED_ANYWHERE, BLOCKED_AS_WORD, RESERVED } from "./blocklist";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
/** How long before a username can be changed again */
export const USERNAME_CHANGE_DAYS = 30;

/** Format only (length, characters). Cheap enough for every keystroke. */
export function usernameFormatError(value: string): string | null {
  if (value.length < USERNAME_MIN_LENGTH) {
    return `Usernames need at least ${USERNAME_MIN_LENGTH} characters.`;
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return `Usernames can be at most ${USERNAME_MAX_LENGTH} characters.`;
  }
  if (!USERNAME_PATTERN.test(value)) {
    return "Use only letters, numbers, and underscores.";
  }
  return null;
}

/** Undo common letter swaps ("sh1t", "@ss", "5ex") */
function decodeLeet(value: string): string {
  return value
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/8/g, "b");
}

/**
 * Split a username into its parts: underscores, digit runs, and
 * camelCase boundaries ("BigAss_99" → ["big", "ass"]).
 */
function nameParts(value: string): string[] {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[_\s]+|\d+/)
    .map((part) => decodeLeet(part))
    .filter(Boolean);
}

/** True when the name is offensive or reserved. */
export function isBlockedUsername(value: string): boolean {
  const squashed = decodeLeet(value).replace(/[^a-z]/g, "");
  if (RESERVED.includes(squashed)) return true;
  if (BLOCKED_ANYWHERE.some((word) => squashed.includes(word))) return true;
  if (BLOCKED_AS_WORD.includes(squashed)) return true;
  return nameParts(value).some((part) => BLOCKED_AS_WORD.includes(part));
}

/** Full check: format, then content. Returns an error message or null. */
export function usernameError(value: string): string | null {
  return usernameFormatError(value) ?? (isBlockedUsername(value) ? "That username isn't allowed. Try another." : null);
}

// ── Suggestions ─────────────────────────────────────────────

const ADJECTIVES = [
  "Swift", "Brave", "Clever", "Lucky", "Sunny", "Mighty", "Quiet", "Bold",
  "Cosmic", "Fuzzy", "Jolly", "Nimble", "Rapid", "Sneaky", "Witty", "Zippy",
  "Golden", "Silver", "Crimson", "Frosty", "Misty", "Turbo", "Pixel", "Super",
];

const ANIMALS = [
  "Otter", "Falcon", "Panda", "Fox", "Tiger", "Koala", "Badger", "Dolphin",
  "Gecko", "Hawk", "Lynx", "Moose", "Owl", "Penguin", "Rabbit", "Raven",
  "Shark", "Sloth", "Wolf", "Yak", "Comet", "Rocket", "Wizard", "Ninja",
];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** A random, always-valid username like "SwiftOtter482". */
export function suggestUsername(): string {
  const number = Math.floor(100 + Math.random() * 900);
  return `${pick(ADJECTIVES)}${pick(ANIMALS)}${number}`;
}
