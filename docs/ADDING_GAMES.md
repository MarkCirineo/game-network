# Adding a New Game to ArcadeKit

This guide is for developers (human or AI) adding a new game to the platform.

## Overview

Every game requires **5 client-side files** and **1 server-side file**, plus **2 one-line registry updates**. The platform's GameShell handles everything else (lobby, room management, WebSocket, SEO, layout, ads, navigation).

## Step-by-Step

### 1. Create the Game Module Directory

```
src/games/your-game-name/
├── index.ts              # Game definition export
├── YourGameName.tsx      # React UI component
├── logic.ts              # Pure game logic functions
└── types.ts              # Game-specific TypeScript types
```

### 2. Define Your Types (`types.ts`)

```typescript
// Define the shape of your game state and player actions

export interface YourGameState {
  // The complete state of your game
  players: string[];         // Player IDs
  currentTurn: string;       // Whose turn (player ID)
  // ... your game-specific state
}

export interface YourGameAction {
  type: 'your_action_type';
  // ... action payload
}
```

### 3. Write Pure Game Logic (`logic.ts`)

```typescript
// Pure functions — NO React, NO DOM, NO side effects
// These can be shared between client and server

import type { YourGameState, YourGameAction } from './types';
import type { GameStatus } from '../../../shared/messages';

export function isValidMove(
  state: YourGameState,
  action: YourGameAction,
  playerId: string
): boolean {
  // Validate the action
}

export function getGameStatus(state: YourGameState): GameStatus {
  // Return { isOver: boolean, winnerId?: string | null }
}
```

### 4. Build the Game Component (`YourGameName.tsx`)

```typescript
'use client';

import type { GameComponentProps } from '../types';
import type { YourGameState, YourGameAction } from './types';

export default function YourGameName({
  gameState,
  myPlayerId,
  isMyTurn,
  isSpectator,
  players,
  sendAction,
}: GameComponentProps<YourGameState, YourGameAction>) {
  // Render your game UI
  // Use sendAction({ type: '...', ... }) to make moves
  // Check isSpectator to disable inputs
  // Check isMyTurn to show turn indicator
}
```

### 5. Export the Game Definition (`index.ts`)

```typescript
import type { GameDefinition } from '../types';
import type { YourGameState, YourGameAction } from './types';
import YourGameName from './YourGameName';

export const yourGame: GameDefinition<YourGameState, YourGameAction> = {
  id: 'your-game-name',           // URL slug
  name: 'Your Game Name',         // Display name
  description: 'Full description for SEO.',
  shortDescription: 'Short tagline for cards.',
  emoji: '🎮',                    // Emoji identifier
  category: 'quick',              // 'quick' | 'strategy' | 'party' | 'word' | 'trivia' | 'creative'
  tags: ['tag1', 'tag2'],
  minPlayers: 2,
  maxPlayers: 2,
  supportsSpectators: true,
  estimatedDuration: '~3 min',
  component: YourGameName,
  accentColor: '#HEX',            // Game-specific theme color
  rules: [
    'Rule 1...',
    'Rule 2...',
  ],
};
```

### 6. Create the Server Engine (`game-server/src/engines/YourGameEngine.ts`)

```typescript
import { GameEngine } from '../GameEngine';
import type { PlayerInfo, GameStatus } from '../../shared/messages';

export class YourGameEngine extends GameEngine {
  createInitialState(players: PlayerInfo[]) {
    return { /* initial game state */ };
  }

  validateAction(state: any, action: any, playerId: string): boolean {
    // Server-side validation
  }

  applyAction(state: any, action: any, playerId: string) {
    // Return new state
  }

  getGameStatus(state: any): GameStatus {
    return { isOver: false };
  }
}
```

### 7. Register the Game (2 files, 1 line each)

**Client registry** (`src/games/registry.ts`):
```typescript
import { yourGame } from './your-game-name';
// Add to the games array:
const games = [...existingGames, yourGame];
```

**Server registry** (`game-server/src/engines/registry.ts`):
```typescript
import { YourGameEngine } from './YourGameEngine';
// Add to the map:
{ 'your-game-name': new YourGameEngine() }
```

Also add the game ID to the valid list in `src/app/api/rooms/create/route.ts` and add game metadata to `src/app/games/[gameId]/page.tsx`.

## Conventions

- **Game IDs**: lowercase, hyphenated (e.g., `tic-tac-toe`)
- **File naming**: PascalCase for components, camelCase for logic
- **State shape**: Always include `players: string[]` and `currentTurn: string` for turn-based games
- **Logic purity**: `logic.ts` must have zero React/DOM imports
- **Spectator support**: Check `isSpectator` prop and disable all inputs
- **Accent colors**: Pick a distinct hex color that doesn't conflict with existing games
- **Mobile-first**: Minimum 44x44px touch targets for interactive elements

## Existing Games for Reference

- `src/games/tic-tac-toe/` — Turn-based, grid game
- `src/games/rock-paper-scissors/` — Simultaneous choice game
