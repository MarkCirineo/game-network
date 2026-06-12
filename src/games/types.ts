// ============================================================
// ArcadeKit — Game Module Type System
// Every game module implements GameDefinition and receives
// GameComponentProps in its React component.
// ============================================================

import type { ComponentType } from 'react';
import type { PlayerInfo, SpectatorInfo, GameStatus } from '../../shared/messages';
import type { GameCategory, PartnerGame } from '../../shared/gameTypes';

// Re-export shared types for convenience
export type { PlayerInfo, SpectatorInfo, GameStatus, GameCategory, PartnerGame };

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
  phase: 'lobby' | 'playing' | 'finished';
}
