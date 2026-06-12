// ============================================================
// ArcadeKit — Player Session Management
// Manages a persistent session token in localStorage for reconnection.
// ============================================================

import { SESSION_TOKEN_KEY, PLAYER_NAME_KEY } from "../constants";

function generateSessionToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Get or create a persistent session token */
export function getSessionToken(): string {
  if (typeof window === "undefined") return "";

  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = generateSessionToken();
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}

/** Get the last-used player name */
export function getSavedPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PLAYER_NAME_KEY) || "";
}

/** Save the player name for next time */
export function savePlayerName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAYER_NAME_KEY, name);
}
