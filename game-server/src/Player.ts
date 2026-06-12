// ============================================================
// ArcadeKit — Player Class
// Represents a connected player with WebSocket communication.
// Handles message serialization and connection state tracking.
// ============================================================

import type { WebSocket } from 'ws';
import type { ServerMessage } from '../../shared/messages.js';

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
}
