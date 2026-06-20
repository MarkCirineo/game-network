import type { WebSocket } from 'ws';
import type { ServerMessage } from '../../shared/messages.js';

// ------------------------------------------------------------
// Snapshot type for persistence (JSON-serializable)
// ------------------------------------------------------------

export interface PlayerSnapshot {
  id: string;
  name: string;
  sessionToken: string;
  isReady: boolean;
  lastActivity: number;
}

export class Player {
  /** Unique player ID (assigned at join time) */
  readonly id: string;

  /** Display name chosen by the player */
  name: string;

  /** Session token for reconnection matching */
  readonly sessionToken: string;

  /** Active WebSocket connection (null if disconnected) */
  ws: WebSocket | null;

  /** Whether the player currently has a live connection */
  isConnected: boolean;

  /** Whether the player has toggled ready in the lobby */
  isReady: boolean;

  /** Timestamp of the last received message or connection event */
  lastActivity: number;

  /** Timestamp when the player disconnected (for reconnect window) */
  disconnectedAt: number | null;

  constructor(
    id: string,
    name: string,
    sessionToken: string,
    ws: WebSocket,
  ) {
    this.id = id;
    this.name = name;
    this.sessionToken = sessionToken;
    this.ws = ws;
    this.isConnected = true;
    this.isReady = false;
    this.lastActivity = Date.now();
    this.disconnectedAt = null;
  }

  /**
   * Send a typed ServerMessage to this player's WebSocket.
   * Silently no-ops if the socket is not open.
   */
  send(message: ServerMessage): void {
    if (!this.ws || this.ws.readyState !== this.ws.OPEN) {
      return;
    }
    try {
      this.ws.send(JSON.stringify(message));
    } catch (err) {
      console.error(`[Player ${this.id}] Failed to send message:`, err);
    }
  }

  /**
   * Gracefully close the WebSocket connection and mark as disconnected.
   */
  disconnect(): void {
    this.isConnected = false;
    this.disconnectedAt = Date.now();
    if (this.ws) {
      try {
        this.ws.close(1000, 'Disconnected');
      } catch {
        // Socket may already be closed — ignore
      }
      this.ws = null;
    }
  }

  /**
   * Re-attach a new WebSocket after a reconnect.
   */
  reconnect(ws: WebSocket): void {
    this.ws = ws;
    this.isConnected = true;
    this.disconnectedAt = null;
    this.lastActivity = Date.now();
  }

  // ----------------------------------------------------------
  // Persistence
  // ----------------------------------------------------------

  /** Serialize to a JSON-safe snapshot (no WebSocket refs) */
  serialize(): PlayerSnapshot {
    return {
      id: this.id,
      name: this.name,
      sessionToken: this.sessionToken,
      isReady: this.isReady,
      lastActivity: this.lastActivity,
    };
  }

  /**
   * Reconstruct a Player from a persisted snapshot.
   * The player starts disconnected (no WebSocket) and awaits reconnection.
   */
  static fromSnapshot(snapshot: PlayerSnapshot): Player {
    // Use Object.assign to bypass readonly — this is a factory method
    // that creates a fully-formed instance without calling the constructor
    const player = Object.create(Player.prototype) as Player;
    Object.assign(player, {
      id: snapshot.id,
      name: snapshot.name,
      sessionToken: snapshot.sessionToken,
      ws: null,
      isConnected: false,
      isReady: snapshot.isReady,
      lastActivity: snapshot.lastActivity,
      disconnectedAt: Date.now(), // Mark as just-disconnected for reconnect window
    });
    return player;
  }
}

