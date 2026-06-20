// ============================================================
// ArcadeKit — Room Class
// Manages the lifecycle of a single game room: lobby, game play,
// finish, and rematch. Handles players, spectators, host
// migration, reconnection, and message routing.
// ============================================================

import type { WebSocket } from 'ws';
import { Player } from './Player.js';
import type { PlayerSnapshot } from './Player.js';
import { GameEngine } from './GameEngine.js';
import type {
  ClientMessage,
  ServerMessage,
  ErrorCode,
  PlayerInfo,
  SpectatorInfo,
  RoomState,
  RoomPhase,
  GameStatus,
} from '../../shared/messages.js';

// Re-export for convenience
export type { RoomPhase };

/** How long a disconnected player can reconnect (ms) */
const RECONNECT_WINDOW_MS = 60_000;

// ------------------------------------------------------------
// Snapshot types for persistence (JSON-serializable)
// ------------------------------------------------------------

export interface RoomSnapshot {
  roomCode: string;
  gameId: string;
  phase: RoomPhase;
  players: PlayerSnapshot[];
  hostId: string | null;
  gameState: unknown;
  gameOptions: Record<string, unknown>;
  joinOrder: string[];
  createdAt: number;
  lastActivity: number;
  rematchVotes: string[];
}

// ------------------------------------------------------------
// Spectator wrapper (lightweight — no game participation)
// ------------------------------------------------------------

interface Spectator {
  id: string;
  name: string;
  ws: WebSocket;
  connectedAt: number;
}

// ============================================================
// Room
// ============================================================

export class Room {
  /** 4-char room code (e.g., "ABCD") */
  readonly roomCode: string;

  /** Game ID this room is configured for (e.g., "tic-tac-toe") */
  readonly gameId: string;

  /** Current lifecycle phase */
  phase: RoomPhase;

  /** Active & recently-disconnected players */
  players: Map<string, Player>;

  /** Connected spectators */
  spectators: Map<string, Spectator>;

  /** Player ID of the current host */
  hostId: string | null;

  /** Current game state (engine-specific shape) */
  gameState: unknown;

  /** Timestamp when the room was created */
  readonly createdAt: number;

  /** Timestamp of the last meaningful activity (for cleanup) */
  lastActivity: number;

  /** The game engine instance for this room's game */
  readonly gameEngine: GameEngine;

  /** Player IDs that have requested a rematch */
  private rematchVotes: Set<string>;

  /** Resolved game options for the current/last game */
  private gameOptions: Record<string, unknown> = {};

  /** Order of player joins (for host migration) */
  private joinOrder: string[];

  /** Timers for disconnect grace windows (keyed by player ID) */
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /** Callback invoked when room state changes and should be persisted */
  onDirty?: () => void;

  constructor(roomCode: string, gameId: string, gameEngine: GameEngine) {
    this.roomCode = roomCode;
    this.gameId = gameId;
    this.gameEngine = gameEngine;
    this.phase = 'waiting';
    this.players = new Map();
    this.spectators = new Map();
    this.hostId = null;
    this.gameState = null;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.rematchVotes = new Set();
    this.joinOrder = [];
  }

  // ----------------------------------------------------------
  // Accessors
  // ----------------------------------------------------------

  get playerCount(): number {
    return this.players.size;
  }

  get spectatorCount(): number {
    return this.spectators.size;
  }

  get maxPlayers(): number {
    return this.gameEngine.maxPlayers;
  }

  get isEmpty(): boolean {
    return this.players.size === 0 && this.spectators.size === 0;
  }

  /** Build a PlayerInfo for the protocol */
  private toPlayerInfo(player: Player): PlayerInfo {
    return {
      id: player.id,
      name: player.name,
      isHost: player.id === this.hostId,
      isReady: player.isReady,
      isConnected: player.isConnected,
    };
  }

  /** Build a SpectatorInfo for the protocol */
  private toSpectatorInfo(spectator: Spectator): SpectatorInfo {
    return {
      id: spectator.id,
      name: spectator.name,
      connectedAt: spectator.connectedAt,
    };
  }

  /** Snapshot the full room state (sent on join and reconnect) */
  getRoomState(): RoomState {
    return {
      roomCode: this.roomCode,
      gameId: this.gameId,
      phase: this.phase,
      players: Array.from(this.players.values()).map((p) => this.toPlayerInfo(p)),
      spectators: Array.from(this.spectators.values()).map((s) => this.toSpectatorInfo(s)),
      hostId: this.hostId ?? '',
      gameState: this.gameState,
      createdAt: this.createdAt,
      gameOptionsSchema: this.gameEngine.getOptionsSchema(),
    };
  }

  // ----------------------------------------------------------
  // Broadcasting
  // ----------------------------------------------------------

  /** Send a message to every connected player */
  private broadcastToPlayers(message: ServerMessage): void {
    for (const player of this.players.values()) {
      player.send(message);
    }
  }

  /** Send a message to every connected spectator */
  private broadcastToSpectators(message: ServerMessage): void {
    for (const spectator of this.spectators.values()) {
      if (spectator.ws.readyState === spectator.ws.OPEN) {
        try {
          spectator.ws.send(JSON.stringify(message));
        } catch {
          // ignore send failures on spectators
        }
      }
    }
  }

  /** Send a message to everyone in the room (players + spectators) */
  private broadcast(message: ServerMessage): void {
    this.broadcastToPlayers(message);
    this.broadcastToSpectators(message);
  }

  /**
   * Send per-player game state updates (uses getPlayerView for hidden info).
   * Spectators receive the host's view (full state for most games).
   */
  private broadcastGameState(): void {
    for (const player of this.players.values()) {
      const view = this.gameEngine.getPlayerView(this.gameState, player.id);
      player.send({ type: 'game_state_update', state: view });
    }
    // Spectators see the full state
    const spectatorMsg: ServerMessage = { type: 'game_state_update', state: this.gameState };
    this.broadcastToSpectators(spectatorMsg);
  }

  /** Notify the persistence layer that state has changed */
  private markDirty(): void {
    this.onDirty?.();
  }

  // ----------------------------------------------------------
  // Player Management
  // ----------------------------------------------------------

  /**
   * Attempt to reconnect a player by session token.
   * @returns true if reconnected, false if no match found.
   */
  tryReconnect(sessionToken: string, ws: WebSocket): boolean {
    for (const player of this.players.values()) {
      if (
        player.sessionToken === sessionToken &&
        !player.isConnected &&
        player.disconnectedAt !== null &&
        Date.now() - player.disconnectedAt < RECONNECT_WINDOW_MS
      ) {
        // Cancel the disconnect grace timer if one exists
        const timer = this.disconnectTimers.get(player.id);
        if (timer) {
          clearTimeout(timer);
          this.disconnectTimers.delete(player.id);
        }

        player.reconnect(ws);
        this.lastActivity = Date.now();
        this.log(`Player "${player.name}" (${player.id}) reconnected`);

        // Send the full room state to the reconnecting player
        player.send({ type: 'room_state', room: this.getRoomState(), yourPlayerId: player.id });

        // Notify others that the player is back (upsert with isConnected: true)
        this.broadcast({ type: 'player_joined', player: this.toPlayerInfo(player) });

        this.markDirty();
        return true;
      }
    }
    return false;
  }

  /**
   * Handle a WebSocket disconnection (socket close event).
   * Unlike removePlayer, this keeps the player in the Map
   * with a grace window to allow reconnection.
   */
  handleDisconnect(id: string): void {
    // Check spectators first — they are removed immediately
    if (this.spectators.has(id)) {
      this.spectators.delete(id);
      this.broadcast({ type: 'spectator_left', spectatorId: id });
      this.log(`Spectator ${id} left`);
      return;
    }

    const player = this.players.get(id);
    if (!player || !player.isConnected) return;

    player.disconnect();
    this.lastActivity = Date.now();
    this.log(`Player "${player.name}" (${id}) disconnected — grace window started`);

    // Broadcast updated player state so others see them as disconnected
    this.broadcast({ type: 'player_joined', player: this.toPlayerInfo(player) });

    // Set a grace timer — if they don't reconnect in time, hard-remove them
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(id);
      this.log(`Player "${player.name}" (${id}) grace window expired — removing`);
      this.removePlayer(id);
    }, RECONNECT_WINDOW_MS);

    this.disconnectTimers.set(id, timer);
    this.markDirty();
  }

  /**
   * Add a new player (or spectator if room is full).
   * @returns The Player/Spectator ID, or null if rejected.
   */
  addPlayer(id: string, name: string, sessionToken: string, ws: WebSocket): string | null {
    // Check for session conflict (same token already connected)
    for (const p of this.players.values()) {
      if (p.sessionToken === sessionToken && p.isConnected) {
        this.sendError(ws, 'SESSION_CONFLICT', 'A player with this session is already connected');
        return null;
      }
    }

    // Check for duplicate name (case-insensitive)
    for (const p of this.players.values()) {
      if (p.name.toLowerCase() === name.toLowerCase() && p.isConnected) {
        this.sendError(ws, 'DUPLICATE_NAME', 'A player with that name is already in the room. Please choose a different name.');
        return null;
      }
    }

    // If game is in progress or room is full, join as spectator
    if (this.phase !== 'waiting' || this.players.size >= this.maxPlayers) {
      return this.addSpectator(id, name, ws);
    }

    const player = new Player(id, name, sessionToken, ws);
    this.players.set(id, player);
    this.joinOrder.push(id);
    this.lastActivity = Date.now();

    // First player becomes host
    if (this.hostId === null) {
      this.hostId = id;
    }

    this.log(`Player "${name}" (${id}) joined [${this.players.size}/${this.maxPlayers}]`);

    // Send room state to the new player
    player.send({ type: 'room_state', room: this.getRoomState(), yourPlayerId: player.id });

    // Notify everyone else
    const joinMsg: ServerMessage = { type: 'player_joined', player: this.toPlayerInfo(player) };
    for (const other of this.players.values()) {
      if (other.id !== id) other.send(joinMsg);
    }
    this.broadcastToSpectators(joinMsg);

    this.markDirty();
    return id;
  }

  /** Add a spectator */
  private addSpectator(id: string, name: string, ws: WebSocket): string {
    const spectator: Spectator = {
      id,
      name,
      ws,
      connectedAt: Date.now(),
    };
    this.spectators.set(id, spectator);
    this.log(`Spectator "${name}" (${id}) joined [${this.spectators.size} spectators]`);

    // Send room state to the spectator
    const roomState = this.getRoomState();
    try {
      ws.send(JSON.stringify({ type: 'room_state', room: roomState, yourPlayerId: id } satisfies ServerMessage));
    } catch { /* ignore */ }

    // Notify others
    this.broadcast({ type: 'spectator_joined', spectator: this.toSpectatorInfo(spectator) });

    return id;
  }

  /**
   * Hard-remove a player from the room (called when grace window expires
   * or when the room is being cleaned up). Handles host migration and
   * game abandonment.
   */
  removePlayer(id: string): void {
    // Check spectators first
    if (this.spectators.has(id)) {
      this.spectators.delete(id);
      this.broadcast({ type: 'spectator_left', spectatorId: id });
      this.log(`Spectator ${id} left`);
      return;
    }

    const player = this.players.get(id);
    if (!player) return;

    // Cancel any pending disconnect timer
    const timer = this.disconnectTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(id);
    }

    // Ensure WebSocket is closed
    if (player.isConnected) {
      player.disconnect();
    }

    this.players.delete(id);
    this.joinOrder = this.joinOrder.filter((pid) => pid !== id);
    this.lastActivity = Date.now();

    this.log(`Player "${player.name}" (${id}) removed`);

    // Notify everyone
    this.broadcast({ type: 'player_left', playerId: id });

    // Host migration: if the leaving player was host, pick the oldest remaining player
    if (this.hostId === id) {
      this.migrateHost();
    }

    // If a game was in progress and not enough players remain, end the game
    if (this.phase === 'playing' && this.connectedPlayerCount < this.gameEngine.minPlayers) {
      const remainingPlayer = this.findFirstConnectedPlayer();
      const status: GameStatus = {
        isOver: true,
        winnerId: remainingPlayer?.id ?? null,
        reason: 'Opponent disconnected',
      };
      this.phase = 'finished';
      this.broadcast({ type: 'game_over', result: status });
      this.log('Game ended: opponent disconnected');
    }

    this.markDirty();
  }

  /** Count of players that are currently connected */
  private get connectedPlayerCount(): number {
    let count = 0;
    for (const p of this.players.values()) {
      if (p.isConnected) count++;
    }
    return count;
  }

  /** Find the first connected player (for game-over winner) */
  private findFirstConnectedPlayer(): Player | undefined {
    for (const p of this.players.values()) {
      if (p.isConnected) return p;
    }
    return undefined;
  }

  /** Promote the oldest remaining player to host */
  private migrateHost(): void {
    if (this.joinOrder.length === 0) {
      this.hostId = null;
      return;
    }
    // Pick the first player in join order that is still in the room
    for (const pid of this.joinOrder) {
      if (this.players.has(pid)) {
        this.hostId = pid;
        this.broadcast({ type: 'host_changed', newHostId: pid });
        this.log(`Host migrated to ${pid}`);
        return;
      }
    }
    this.hostId = null;
  }

  /**
   * Clean up all disconnect timers (called during room destruction)
   */
  clearAllTimers(): void {
    for (const timer of this.disconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.disconnectTimers.clear();
  }

  // ----------------------------------------------------------
  // Message Handling
  // ----------------------------------------------------------

  /**
   * Route an incoming ClientMessage from a connected player.
   * This is the main entry point for all client communication.
   */
  handleMessage(playerId: string, raw: string): void {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      const player = this.players.get(playerId);
      if (player) player.send({ type: 'error', code: 'INVALID_MESSAGE', message: 'Malformed JSON' });
      return;
    }

    // Update activity timestamp
    const player = this.players.get(playerId);
    if (player) player.lastActivity = Date.now();
    this.lastActivity = Date.now();

    switch (msg.type) {
      case 'ping':
        this.handlePing(playerId);
        break;
      case 'player_ready':
        this.handlePlayerReady(playerId);
        break;
      case 'start_game':
        this.handleStartGame(playerId, msg.options);
        break;
      case 'game_action':
        this.handleGameAction(playerId, msg.action);
        break;
      case 'rematch_request':
        this.handleRematchRequest(playerId);
        break;
      default:
        if (player) {
          player.send({ type: 'error', code: 'INVALID_MESSAGE', message: `Unknown message type` });
        }
    }
  }

  /** Handle spectator messages (limited to ping) */
  handleSpectatorMessage(spectatorId: string, raw: string): void {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }

    if (msg.type === 'ping') {
      const spectator = this.spectators.get(spectatorId);
      if (spectator && spectator.ws.readyState === spectator.ws.OPEN) {
        spectator.ws.send(JSON.stringify({ type: 'pong' } satisfies ServerMessage));
      }
    }
  }

  private handlePing(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) player.send({ type: 'pong' });
  }

  private handlePlayerReady(playerId: string): void {
    if (this.phase !== 'waiting') {
      this.sendErrorToPlayer(playerId, 'GAME_ALREADY_STARTED', 'Cannot toggle ready during a game');
      return;
    }

    const player = this.players.get(playerId);
    if (!player) return;

    player.isReady = !player.isReady;
    this.broadcast({
      type: 'player_ready_changed',
      playerId: player.id,
      isReady: player.isReady,
    });

    this.markDirty();
  }

  private handleStartGame(playerId: string, options?: Record<string, unknown>): void {
    // Only the host can start
    if (playerId !== this.hostId) {
      this.sendErrorToPlayer(playerId, 'NOT_HOST', 'Only the host can start the game');
      return;
    }

    if (this.phase !== 'waiting') {
      this.sendErrorToPlayer(playerId, 'GAME_ALREADY_STARTED', 'Game has already started');
      return;
    }

    // Check minimum player count
    if (this.players.size < this.gameEngine.minPlayers) {
      this.sendErrorToPlayer(
        playerId,
        'NOT_ENOUGH_PLAYERS',
        `Need at least ${this.gameEngine.minPlayers} players to start`,
      );
      return;
    }

    // Resolve options: merge user options with engine defaults
    const defaults = this.gameEngine.getDefaultOptions();
    this.gameOptions = { ...defaults, ...options };

    // Create initial game state
    const playerInfos = Array.from(this.players.values()).map((p) => this.toPlayerInfo(p));
    this.gameState = this.gameEngine.createInitialState(playerInfos, this.gameOptions);
    this.phase = 'playing';

    this.log('Game started');

    // Broadcast the game_started message with initial state
    this.broadcast({ type: 'game_started', initialState: this.gameState });

    // Also send per-player views (for games with hidden info)
    this.broadcastGameState();

    this.markDirty();
  }

  private handleGameAction(playerId: string, action: unknown): void {
    if (this.phase !== 'playing') {
      this.sendErrorToPlayer(playerId, 'GAME_NOT_STARTED', 'No game in progress');
      return;
    }

    // Validate the action
    if (!this.gameEngine.validateAction(this.gameState, action, playerId)) {
      this.sendErrorToPlayer(playerId, 'INVALID_ACTION', 'That action is not valid right now');
      return;
    }

    // Apply the action
    this.gameState = this.gameEngine.applyAction(this.gameState, action, playerId);

    // Broadcast updated state (per-player views)
    this.broadcastGameState();

    // Check if the game is over
    const status = this.gameEngine.getGameStatus(this.gameState);
    if (status.isOver) {
      this.phase = 'finished';
      this.broadcast({ type: 'game_over', result: status });
      this.log(`Game over: ${status.reason ?? 'finished'}`);
    }

    this.markDirty();
  }

  private handleRematchRequest(playerId: string): void {
    if (this.phase !== 'finished') {
      this.sendErrorToPlayer(playerId, 'GAME_NOT_STARTED', 'Game is not finished yet');
      return;
    }

    this.rematchVotes.add(playerId);
    this.broadcast({ type: 'rematch_requested', playerId });

    this.log(`Rematch vote from ${playerId} [${this.rematchVotes.size}/${this.players.size}]`);

    // If all players have voted for rematch, restart
    const allVoted = Array.from(this.players.keys()).every((pid) => this.rematchVotes.has(pid));
    if (allVoted && this.players.size >= this.gameEngine.minPlayers) {
      this.startRematch();
    }

    this.markDirty();
  }

  /** Reset the room for a new round */
  private startRematch(): void {
    this.log('Rematch starting — resetting room');

    // Reset readiness and rematch votes
    for (const player of this.players.values()) {
      player.isReady = false;
    }
    this.rematchVotes.clear();

    // Create fresh game state and switch back to playing
    const playerInfos = Array.from(this.players.values()).map((p) => this.toPlayerInfo(p));
    this.gameState = this.gameEngine.createInitialState(playerInfos, this.gameOptions);
    this.phase = 'playing';

    this.broadcast({ type: 'game_started', initialState: this.gameState });
    this.broadcastGameState();

    this.markDirty();
  }

  // ----------------------------------------------------------
  // Persistence
  // ----------------------------------------------------------

  /** Serialize the room to a JSON-safe snapshot */
  serialize(): RoomSnapshot {
    return {
      roomCode: this.roomCode,
      gameId: this.gameId,
      phase: this.phase,
      players: Array.from(this.players.values()).map((p) => p.serialize()),
      hostId: this.hostId,
      gameState: this.gameState,
      gameOptions: this.gameOptions,
      joinOrder: [...this.joinOrder],
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      rematchVotes: Array.from(this.rematchVotes),
    };
  }

  /**
   * Reconstruct a Room from a persisted snapshot.
   * All players start disconnected and must reconnect via tryReconnect.
   */
  static fromSnapshot(snapshot: RoomSnapshot, gameEngine: GameEngine): Room {
    const room = new Room(snapshot.roomCode, snapshot.gameId, gameEngine);

    // Override constructor defaults with snapshot data
    room.phase = snapshot.phase;
    room.hostId = snapshot.hostId;
    room.gameState = snapshot.gameState;
    room.gameOptions = snapshot.gameOptions;
    room.joinOrder = [...snapshot.joinOrder];
    // Use Object.assign to set readonly properties from snapshot
    Object.assign(room, {
      createdAt: snapshot.createdAt,
    });
    room.lastActivity = snapshot.lastActivity;
    room.rematchVotes = new Set(snapshot.rematchVotes);

    // Restore players (all start disconnected)
    for (const ps of snapshot.players) {
      const player = Player.fromSnapshot(ps);
      room.players.set(player.id, player);
    }

    room.log(`Rehydrated from persistence [${room.players.size} players, phase=${room.phase}]`);
    return room;
  }

  // ----------------------------------------------------------
  // Error helpers
  // ----------------------------------------------------------

  private sendErrorToPlayer(playerId: string, code: ErrorCode, message: string): void {
    const player = this.players.get(playerId);
    if (player) player.send({ type: 'error', code, message });
  }

  private sendError(ws: WebSocket, code: ErrorCode, message: string): void {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'error', code, message } satisfies ServerMessage));
      } catch { /* ignore */ }
    }
  }

  // ----------------------------------------------------------
  // Logging
  // ----------------------------------------------------------

  private log(msg: string): void {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [Room ${this.roomCode}] ${msg}`);
  }
}
