// ============================================================
// ArcadeKit — Analytics Event Catalog
// Every Umami custom event, in one place, for the site and the
// game server. Names are fixed; anything that varies goes in the
// event's properties so Umami can break it down.
//
// Shared property names:
//   game      — game id from the catalog (e.g. "hangman")
//   location  — where on the site the action happened
//   result    — outcome of the action
//   feature   — coming-soon feature key
//
// Never send names, room codes, or anything a player typed.
// ============================================================

/** Umami server; the site loads its tracker script from here */
export const UMAMI_ORIGIN = 'https://analytics.markcirineo.com';
export const UMAMI_WEBSITE_ID = '0a833a1c-b423-449c-bcc8-347bf484e0b8';

export type EventData = Record<string, string | number | boolean | undefined>;

// ------------------------------------------------------------
// Browser events (sent with trackEvent from src/lib/analytics.ts)
// ------------------------------------------------------------

export interface ClientEvents {
  /** Landed on /coming-soon; feature is the key, "none" or "unknown" */
  'coming-soon-view': { feature: string };
  /** Clicked "I'd use this" on a coming-soon feature */
  'coming-soon-interest': { feature: string; from: string; placement: 'main' | 'list' };
  /** Clicked an Amazon gear link */
  'affiliate-click': { product: string };
  /** Copied the room code or invite link */
  'invite-copy': { game: string; target: 'code' | 'link' };
  /** Opened the native share sheet from the invite panel */
  'invite-share': { game: string };
  /** Submitted a room code */
  'join-room-by-code': {
    location: 'home' | 'game-page';
    game?: string;
    result: 'found' | 'not-found' | 'error';
  };
  /** Clicked a button on the game-over screen */
  'after-game': { game: string; choice: 'rematch' | 'back-to-games' };
  /** First real interaction with a tool on this visit */
  'tool-use': { tool: string };
  /** Opened the feedback dialog */
  'feedback-open': { game?: string };
  /** Sent feedback successfully */
  'feedback-submit': { type: string; game?: string };
}

/**
 * Events fired from HTML attributes in server components
 * (data-umami-event="…" data-umami-event-<prop>="…"), listed here
 * so the catalog is complete:
 *
 *   coming-soon-play  { game, feature }   game link on /coming-soon
 *   guide-play        { game, placement } "Play" link on a how-to-play guide
 *   guide-tool        { game, tool }      related-tool link on a guide
 */

// ------------------------------------------------------------
// Game server events (sent with trackServerEvent from
// game-server/src/analytics.ts). Sent once per room, so they're
// exact counts that ad blockers can't hide.
// ------------------------------------------------------------

export interface ServerEvents {
  /** A room was created (someone clicked Create Room) */
  'room-created': { game: string };
  /**
   * A game started — every game, including rematches. Game options
   * are added as option_<key> properties (e.g. option_theme).
   */
  'game-started': { game: string; players: number; game_number: number; rematch: boolean };
  /** A game ended */
  'game-finished': {
    game: string;
    players: number;
    game_number: number;
    duration_s: number;
    result: 'win' | 'draw' | 'opponent-left';
  };
  /** A player clicked Play Again */
  'rematch-vote': { game: string; votes: number; players: number };
  /** Everyone voted and a rematch started (also fires game-started) */
  'rematch-started': { game: string; players: number; game_number: number };
  /** A room was cleaned up */
  'room-closed': {
    game: string;
    games_played: number;
    peak_players: number;
    closed_during: 'waiting' | 'playing' | 'finished';
    minutes_open: number;
  };
}
