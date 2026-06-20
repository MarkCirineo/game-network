// ============================================================
// ArcadeKit — Room Store (Redis Persistence)
// Handles serialization/deserialization of room state via Redis.
// Provides graceful degradation: if Redis is unreachable,
// the server still works — rooms just won't persist.
// ============================================================

import Redis from 'ioredis';
import { Room } from './Room.js';
import type { RoomSnapshot } from './Room.js';
import type { GameEngine } from './GameEngine.js';

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const ROOM_KEY_PREFIX = 'room:';

/** TTL for room keys in Redis (seconds). Refreshed on every save. */
const ROOM_TTL_SECONDS = 20 * 60; // 20 minutes

// ============================================================
// Room Store
// ============================================================

export class RoomStore {
  private redis: Redis;
  private connected: boolean = false;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      // Retry connection with capped exponential backoff
      retryStrategy: (times: number) => {
        if (times > 20) return null; // Stop retrying after ~20 attempts
        return Math.min(times * 200, 5000);
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.connected = true;
      this.log('Connected to Redis');
    });

    this.redis.on('ready', () => {
      this.connected = true;
    });

    this.redis.on('error', (err: Error) => {
      this.log(`Redis error: ${err.message}`);
    });

    this.redis.on('close', () => {
      this.connected = false;
      this.log('Redis connection closed');
    });
  }

  // ----------------------------------------------------------
  // Connection
  // ----------------------------------------------------------

  /** Establish the Redis connection */
  async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Failed to connect to Redis: ${msg}`);
      this.log('Server will operate without persistence');
    }
  }

  /** Gracefully close the Redis connection */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      // Force disconnect if graceful quit fails
      this.redis.disconnect();
    }
    this.connected = false;
  }

  /** Whether the Redis connection is currently active */
  get isConnected(): boolean {
    return this.connected;
  }

  // ----------------------------------------------------------
  // Room Operations
  // ----------------------------------------------------------

  /**
   * Save a room snapshot to Redis.
   * Sets the key with a TTL that refreshes on each save.
   */
  async save(room: Room): Promise<void> {
    if (!this.connected) return;

    try {
      const snapshot = room.serialize();
      const key = `${ROOM_KEY_PREFIX}${room.roomCode}`;
      const data = JSON.stringify(snapshot);

      await this.redis.set(key, data, 'EX', ROOM_TTL_SECONDS);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Failed to save room ${room.roomCode}: ${msg}`);
    }
  }

  /**
   * Delete a room from Redis.
   */
  async delete(roomCode: string): Promise<void> {
    if (!this.connected) return;

    try {
      await this.redis.del(`${ROOM_KEY_PREFIX}${roomCode}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Failed to delete room ${roomCode}: ${msg}`);
    }
  }

  /**
   * Load all persisted rooms from Redis.
   * Used on server startup to rehydrate rooms that survived the restart.
   *
   * @param getEngine - Function to look up a GameEngine by game ID
   * @returns Array of rehydrated Room instances
   */
  async loadAll(
    getEngine: (gameId: string) => GameEngine | undefined,
  ): Promise<Room[]> {
    if (!this.connected) {
      this.log('Redis not connected — skipping room rehydration');
      return [];
    }

    const rooms: Room[] = [];

    try {
      // Use SCAN to iterate room keys without blocking Redis
      const keys: string[] = [];
      let cursor = '0';

      do {
        const [nextCursor, batch] = await this.redis.scan(
          cursor,
          'MATCH',
          `${ROOM_KEY_PREFIX}*`,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        keys.push(...batch);
      } while (cursor !== '0');

      if (keys.length === 0) {
        this.log('No persisted rooms found');
        return [];
      }

      this.log(`Found ${keys.length} persisted room(s) — rehydrating...`);

      // Fetch all room data in a single pipeline for efficiency
      const pipeline = this.redis.pipeline();
      for (const key of keys) {
        pipeline.get(key);
      }
      const results = await pipeline.exec();

      for (let i = 0; i < keys.length; i++) {
        const result = results?.[i];
        if (!result) continue;

        const [err, data] = result;
        if (err || !data || typeof data !== 'string') continue;

        try {
          const snapshot = JSON.parse(data) as RoomSnapshot;

          // Look up the game engine
          const engine = getEngine(snapshot.gameId);
          if (!engine) {
            this.log(`Skipping room ${snapshot.roomCode}: unknown game ID "${snapshot.gameId}"`);
            // Clean up orphaned key
            await this.redis.del(keys[i]);
            continue;
          }

          const room = Room.fromSnapshot(snapshot, engine);
          rooms.push(room);
        } catch (parseErr) {
          const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
          this.log(`Failed to parse room data for key ${keys[i]}: ${msg}`);
          // Clean up corrupted key
          await this.redis.del(keys[i]);
        }
      }

      this.log(`Rehydrated ${rooms.length} room(s) successfully`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Failed to load rooms from Redis: ${msg}`);
    }

    return rooms;
  }

  // ----------------------------------------------------------
  // Logging
  // ----------------------------------------------------------

  private log(msg: string): void {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [RoomStore] ${msg}`);
  }
}
