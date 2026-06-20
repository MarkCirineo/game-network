// ============================================================
// ArcadeKit — Room Manager
// Central registry for all active rooms. Handles room creation,
// lookup, cleanup, and the HTTP API for room creation.
// Integrates with RoomStore for Redis persistence.
// ============================================================

import { Room } from './Room.js';
import { getEngine, hasEngine } from './engines/registry.js';
import { RoomStore } from './RoomStore.js';
import type { CreateRoomRequest, CreateRoomResponse, RoomInfoResponse } from '../../shared/messages.js';

// Custom alphabet for room codes: excludes ambiguous characters (0, O, 1, I)
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 4;

/** How often to run periodic cleanup (ms) */
const CLEANUP_INTERVAL_MS = 60_000;

/** Destroy rooms that have been empty for this long (ms) */
const EMPTY_ROOM_TTL_MS = 60_000;

/** Destroy rooms that have had no activity for this long (ms) */
const INACTIVE_ROOM_TTL_MS = 15 * 60_000;

// ============================================================
// Room Manager
// ============================================================

export class RoomManager {
  /** All active rooms, keyed by room code */
  private rooms: Map<string, Room> = new Map();

  /** Handle for the periodic cleanup timer */
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  /** Redis persistence layer */
  private store: RoomStore | null;

  constructor(store?: RoomStore) {
    this.store = store ?? null;

    // Start periodic cleanup
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
    this.log('Room manager initialized');
  }

  // ----------------------------------------------------------
  // Initialization (rehydration from Redis)
  // ----------------------------------------------------------

  /**
   * Load persisted rooms from Redis on startup.
   * Should be called once during server initialization.
   */
  async rehydrate(): Promise<void> {
    if (!this.store) return;

    try {
      const rooms = await this.store.loadAll(getEngine);

      for (const room of rooms) {
        // Wire up the dirty callback so state changes persist
        this.wireRoomPersistence(room);
        this.rooms.set(room.roomCode, room);
      }

      if (rooms.length > 0) {
        this.log(`Rehydrated ${rooms.length} room(s) from Redis`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Failed to rehydrate rooms: ${msg}`);
    }
  }

  // ----------------------------------------------------------
  // Room CRUD
  // ----------------------------------------------------------

  /**
   * Create a new room for the given game ID.
   * Generates a unique 4-char room code with collision retry.
   */
  createRoom(gameId: string): Room | null {
    const engine = getEngine(gameId);
    if (!engine) {
      this.log(`Cannot create room: unknown game ID "${gameId}"`);
      return null;
    }

    // Generate a unique room code (retry on collision)
    let roomCode: string;
    let attempts = 0;
    do {
      roomCode = this.generateRoomCode();
      attempts++;
      if (attempts > 100) {
        this.log('CRITICAL: Failed to generate unique room code after 100 attempts');
        return null;
      }
    } while (this.rooms.has(roomCode));

    const room = new Room(roomCode, gameId, engine);
    this.wireRoomPersistence(room);
    this.rooms.set(roomCode, room);

    this.log(`Room ${roomCode} created for game "${gameId}" [${this.rooms.size} total rooms]`);

    // Persist the new room
    this.store?.save(room).catch(() => {});

    return room;
  }

  /** Look up a room by code */
  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  /** Remove a room by code */
  removeRoom(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.clearAllTimers();
      this.rooms.delete(roomCode);
      this.store?.delete(roomCode).catch(() => {});
      this.log(`Room ${roomCode} removed [${this.rooms.size} total rooms]`);
    }
  }

  /** Get all active rooms (for debugging / admin) */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // ----------------------------------------------------------
  // Persistence Wiring
  // ----------------------------------------------------------

  /**
   * Wire the onDirty callback on a room so that every state
   * change triggers a Redis save.
   */
  private wireRoomPersistence(room: Room): void {
    if (!this.store) return;

    const store = this.store;
    room.onDirty = () => {
      store.save(room).catch(() => {});
    };
  }

  // ----------------------------------------------------------
  // HTTP API Handlers
  // ----------------------------------------------------------

  /**
   * Handle a POST /create-room request from the Next.js API.
   * @returns CreateRoomResponse or an error object.
   */
  handleCreateRoom(body: CreateRoomRequest): CreateRoomResponse | { error: string } {
    if (!body.gameId || !hasEngine(body.gameId)) {
      return { error: `Unknown game ID: "${body.gameId}"` };
    }

    const room = this.createRoom(body.gameId);
    if (!room) {
      return { error: 'Failed to create room' };
    }

    return { roomCode: room.roomCode };
  }

  /**
   * Handle a GET /room-info/:roomCode request.
   * @returns RoomInfoResponse or an error object.
   */
  handleRoomInfo(roomCode: string): RoomInfoResponse | { error: string } {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { error: `Room "${roomCode}" not found` };
    }

    return {
      roomCode: room.roomCode,
      gameId: room.gameId,
      phase: room.phase,
      playerCount: room.playerCount,
      maxPlayers: room.maxPlayers,
      spectatorCount: room.spectatorCount,
    };
  }

  // ----------------------------------------------------------
  // Room Code Generation
  // ----------------------------------------------------------

  /** Generate a random room code using the custom alphabet */
  private generateRoomCode(): string {
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      const idx = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
      code += ROOM_CODE_ALPHABET[idx];
    }
    return code;
  }

  // ----------------------------------------------------------
  // Periodic Cleanup
  // ----------------------------------------------------------

  /** Remove stale/empty rooms */
  private cleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [code, room] of this.rooms) {
      // Remove rooms that have been empty for too long
      if (room.isEmpty && now - room.lastActivity > EMPTY_ROOM_TTL_MS) {
        toRemove.push(code);
        continue;
      }

      // Remove rooms that have been inactive for too long
      if (now - room.lastActivity > INACTIVE_ROOM_TTL_MS) {
        toRemove.push(code);
        continue;
      }
    }

    for (const code of toRemove) {
      const room = this.rooms.get(code);
      if (room) {
        room.clearAllTimers();
      }
      this.rooms.delete(code);
      this.store?.delete(code).catch(() => {});
      this.log(`Cleanup: removed stale room ${code}`);
    }

    if (toRemove.length > 0) {
      this.log(`Cleanup complete: removed ${toRemove.length} rooms, ${this.rooms.size} remaining`);
    }
  }

  // ----------------------------------------------------------
  // Shutdown
  // ----------------------------------------------------------

  /** Stop the cleanup timer and clean up all rooms */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Clear all disconnect timers in all rooms
    for (const room of this.rooms.values()) {
      room.clearAllTimers();
    }

    this.rooms.clear();
    this.log('Room manager shut down');
  }

  // ----------------------------------------------------------
  // Logging
  // ----------------------------------------------------------

  private log(msg: string): void {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [RoomManager] ${msg}`);
  }
}
