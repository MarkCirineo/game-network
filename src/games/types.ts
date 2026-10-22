// ============================================================
// ArcadeKit — Game Module Type System
// Every game module implements GameDefinition and receives
// GameComponentProps in its React component.
// ============================================================

import type { ComponentType } from 'react';
import type { PlayerInfo, SpectatorInfo, GameStatus, RoomPhase } from '../../shared/messages';
import type { GameCategory, PartnerGame } from '../../shared/gameTypes';
import type { GameOptionSchema } from '../../shared/gameOptions';

// Re-export shared types for convenience
export type { PlayerInfo, SpectatorInfo, GameStatus, GameCategory, PartnerGame, RoomPhase, GameOptionSchema };

// ------------------------------------------------------------
// Game Definition — the manifest for a game module
// ------------------------------------------------------------

export interface GameDefinition<TState = any, TAction = any> {
  /** Unique slug identifier, e.g. 'tic-tac-toe' */
  id: string;
  /** Human-readable display name */
  name: string;
  /** Full description shown on game detail pages */
  description: string;
  /** One-line teaser shown in cards/lists */
  shortDescription: string;
  /** Emoji icon for the game */
  emoji: string;
  /** Categorization for filtering */
  category: GameCategory;
  /** Searchable tags */
  tags: string[];
  /** Minimum players required to start */
  minPlayers: number;
  /** Maximum players allowed */
  maxPlayers: number;
  /** Whether spectators can watch live games */
  supportsSpectators: boolean;
  /** Human-readable estimated play time */
  estimatedDuration: string;
  /** The React component that renders the game */
  component: ComponentType<GameComponentProps<TState, TAction>>;
  /** Primary accent color hex for theming game cards & UI chrome */
  accentColor: string;
  /** Ordered list of rules shown to players */
  rules: string[];
  /** Optional schema for configurable game options (shown in lobby) */
  optionsSchema?: GameOptionSchema[];
  /** Optional extra content for the game-over screen (e.g. a reveal) */
  ResultComponent?: ComponentType<GameResultProps<TState>>;
  /** Let the game area grow past the default width on large screens */
  wideLayout?: boolean;
  /** Optional lobby section for options the schema can't express (e.g. a board picker) */
  LobbyOptions?: ComponentType<LobbyOptionsProps>;
  /**
   * Optional step before the host's start_game is sent, e.g. fetching
   * a pack pass. Returns the options to send; throw an Error with a
   * player-facing message to cancel the start.
   */
  prepareStart?: (options: Record<string, unknown>, roomCode: string) => Promise<Record<string, unknown>>;
}

// ------------------------------------------------------------
// Lobby Options Props — passed to a game's custom lobby section
// ------------------------------------------------------------

export interface LobbyOptionsProps {
  /** Room the lobby belongs to */
  roomCode: string;
  /** Only the host can change options */
  isHost: boolean;
  /** The host's current option choices */
  options: Record<string, unknown>;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

// ------------------------------------------------------------
// Game Result Props — passed to an optional game-over section
// ------------------------------------------------------------

export interface GameResultProps<TState = unknown> {
  /** The final game state (the viewer's sanitized view) */
  gameState: TState;
  /** The local player's ID */
  myPlayerId: string;
  /** All players in the room */
  players: PlayerInfo[];
  /** Whether the local user is a spectator */
  isSpectator: boolean;
}

// ------------------------------------------------------------
// Game Component Props — passed to every game UI component
// ------------------------------------------------------------

export interface GameComponentProps<TState = any, TAction = any> {
  /** The current game state from the server */
  gameState: TState;
  /** The local player's ID */
  myPlayerId: string;
  /** Whether it is the local player's turn */
  isMyTurn: boolean;
  /** Whether the local user is a spectator (read-only) */
  isSpectator: boolean;
  /** All players in the room */
  players: PlayerInfo[];
  /** All spectators in the room */
  spectators: SpectatorInfo[];
  /** Dispatch a game action to the server */
  sendAction: (action: TAction) => void;
  /** Current room phase */
  phase: RoomPhase;
}
