// ============================================================
// ArcadeKit — Game Server Entry Point
// HTTP + WebSocket server. Handles connection routing, heartbeat,
// room creation API, and graceful shutdown.
// ============================================================

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { URL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { RoomManager } from './RoomManager.js';
import type { CreateRoomRequest } from '../../shared/messages.js';

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HEARTBEAT_INTERVAL_MS = 30_000;

// ------------------------------------------------------------
// State
// ------------------------------------------------------------

const roomManager = new RoomManager();

/**
 * Track which room & role each WebSocket belongs to,
 * so we can clean up on disconnect.
 */
interface ConnectionMeta {
  roomCode: string;
  playerId: string;
  isSpectator: boolean;
}
const connectionMap = new WeakMap<WebSocket, ConnectionMeta>();

// ------------------------------------------------------------
// HTTP Server
// ------------------------------------------------------------

const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  // CORS headers (game server is on a different port than Next.js)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  // POST /create-room
  if (req.method === 'POST' && url.pathname === '/create-room') {
    handleCreateRoom(req, res);
    return;
  }

  // GET /room-info/:roomCode
  const roomInfoMatch = url.pathname.match(/^\/room-info\/([A-Z0-9]{4})$/i);
  if (req.method === 'GET' && roomInfoMatch) {
    const roomCode = roomInfoMatch[1].toUpperCase();
    const result = roomManager.handleRoomInfo(roomCode);
    if ('error' in result) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    }
    return;
  }

  // GET /health
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', rooms: roomManager.getAllRooms().length }));
    return;
  }

  // Fallback: 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

/** Parse JSON body and handle POST /create-room */
function handleCreateRoom(req: IncomingMessage, res: ServerResponse): void {
  let body = '';
  req.on('data', (chunk: Buffer) => {
    body += chunk.toString();
    // Guard against excessively large payloads
    if (body.length > 10_000) {
      res.writeHead(413);
      res.end(JSON.stringify({ error: 'Payload too large' }));
      req.destroy();
    }
  });
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body) as CreateRoomRequest;
      const result = roomManager.handleCreateRoom(parsed);
      if ('error' in result) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
      } else {
        res.writeHead(201, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify(result));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
  });
  req.on('error', () => {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal error' }));
  });
}

// ------------------------------------------------------------
// WebSocket Server
// ------------------------------------------------------------

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const roomCode = url.searchParams.get('roomCode')?.toUpperCase() ?? '';
  const sessionToken = url.searchParams.get('sessionToken') ?? '';
  const playerName = url.searchParams.get('playerName') ?? 'Anonymous';

  log(`WebSocket connection: room=${roomCode} name="${playerName}"`);

  // Validate room code
  if (!roomCode) {
    ws.send(JSON.stringify({ type: 'error', code: 'ROOM_NOT_FOUND', message: 'No room code provided' }));
    ws.close(4000, 'No room code');
    return;
  }

  const room = roomManager.getRoom(roomCode);
  if (!room) {
    ws.send(JSON.stringify({ type: 'error', code: 'ROOM_NOT_FOUND', message: `Room "${roomCode}" not found` }));
    ws.close(4001, 'Room not found');
    return;
  }

  // Attempt reconnect first (if session token matches a disconnected player)
  if (sessionToken && room.tryReconnect(sessionToken, ws)) {
    // Find the reconnected player to set up connectionMap
    for (const player of room.players.values()) {
      if (player.sessionToken === sessionToken && player.isConnected) {
        connectionMap.set(ws, { roomCode, playerId: player.id, isSpectator: false });
        setupPlayerSocket(ws, room, player.id, false);
        return;
      }
    }
  }

  // New player/spectator join
  const playerId = randomUUID();
  const joinedId = room.addPlayer(playerId, playerName, sessionToken, ws);

  if (!joinedId) {
    ws.close(4002, 'Join rejected');
    return;
  }

  // Determine if joined as spectator or player
  const isSpectator = room.spectators.has(joinedId);
  connectionMap.set(ws, { roomCode, playerId: joinedId, isSpectator });
  setupPlayerSocket(ws, room, joinedId, isSpectator);
});

/** Wire up message/close/error handlers for a connected socket */
function setupPlayerSocket(ws: WebSocket, room: ReturnType<typeof roomManager.getRoom>, playerId: string, isSpectator: boolean): void {
  if (!room) return;

  ws.on('message', (data: Buffer | string) => {
    try {
      const raw = typeof data === 'string' ? data : data.toString('utf-8');
      if (isSpectator) {
        room.handleSpectatorMessage(playerId, raw);
      } else {
        room.handleMessage(playerId, raw);
      }
    } catch (err) {
      console.error(`[Socket] Error handling message from ${playerId}:`, err);
    }
  });

  ws.on('close', () => {
    log(`WebSocket closed: player=${playerId} spectator=${isSpectator}`);
    room.removePlayer(playerId);
    connectionMap.delete(ws);

    // If room is now empty, it will be cleaned up by periodic cleanup
  });

  ws.on('error', (err) => {
    console.error(`[Socket] Error for player ${playerId}:`, err.message);
  });
}

// ------------------------------------------------------------
// Heartbeat (ping/pong at WebSocket protocol level)
// ------------------------------------------------------------

const aliveMap = new WeakMap<WebSocket, boolean>();

const heartbeatInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (aliveMap.get(ws) === false) {
      // No pong received since last ping — terminate
      log('Terminating unresponsive WebSocket');
      ws.terminate();
      continue;
    }
    aliveMap.set(ws, false);
    ws.ping();
  }
}, HEARTBEAT_INTERVAL_MS);

wss.on('connection', (ws: WebSocket) => {
  aliveMap.set(ws, true);
  ws.on('pong', () => {
    aliveMap.set(ws, true);
  });
});

// ------------------------------------------------------------
// Startup
// ------------------------------------------------------------

httpServer.listen(PORT, () => {
  log(`🎮 ArcadeKit Game Server running on port ${PORT}`);
  log(`   WebSocket: ws://localhost:${PORT}`);
  log(`   HTTP API:  http://localhost:${PORT}`);
});

// ------------------------------------------------------------
// Graceful Shutdown
// ------------------------------------------------------------

function shutdown(signal: string): void {
  log(`Received ${signal} — shutting down gracefully...`);

  clearInterval(heartbeatInterval);

  // Close all WebSocket connections
  for (const ws of wss.clients) {
    ws.close(1001, 'Server shutting down');
  }

  wss.close(() => {
    log('WebSocket server closed');
  });

  roomManager.shutdown();

  httpServer.close(() => {
    log('HTTP server closed');
    process.exit(0);
  });

  // Force exit after 5 seconds if graceful shutdown stalls
  setTimeout(() => {
    console.error('Forced exit after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ------------------------------------------------------------
// Logging
// ------------------------------------------------------------

function log(msg: string): void {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [Server] ${msg}`);
}
