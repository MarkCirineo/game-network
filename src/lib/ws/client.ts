// ============================================================
// ArcadeKit — WebSocket Client Hook
// Manages connection, reconnection, and message dispatching.
// ============================================================

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useGameStore, type ConnectionStatus } from "../stores/gameStore";
import type { ClientMessage, ServerMessage } from "../../../shared/messages";
import {
  WS_URL,
  WS_RECONNECT_BASE_DELAY,
  WS_RECONNECT_MAX_DELAY,
  WS_RECONNECT_MAX_ATTEMPTS,
  WS_PING_INTERVAL,
} from "../constants";

interface UseGameSocketOptions {
  roomCode: string;
  playerName: string;
  sessionToken: string;
  enabled?: boolean;
}

interface UseGameSocketReturn {
  sendMessage: (msg: ClientMessage) => void;
  connectionStatus: ConnectionStatus;
  sendAction: (action: unknown) => void;
}

export function useGameSocket({
  roomCode,
  playerName,
  sessionToken,
  enabled = true,
}: UseGameSocketOptions): UseGameSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pingTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const mountedRef = useRef(true);

  const connectionStatus = useGameStore((s) => s.connectionStatus);
  const setConnectionStatus = useGameStore((s) => s.setConnectionStatus);
  const handleServerMessage = useGameStore((s) => s.handleServerMessage);
  const setMyPlayerId = useGameStore((s) => s.setMyPlayerId);
  const setIsSpectator = useGameStore((s) => s.setIsSpectator);

  const sendMessage = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const sendAction = useCallback(
    (action: unknown) => {
      sendMessage({ type: "game_action", action });
    },
    [sendMessage]
  );

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (wsRef.current.readyState < WebSocket.CLOSING) {
        wsRef.current.close();
      }
    }

    setConnectionStatus(attemptRef.current === 0 ? "connecting" : "reconnecting");

    const url = `${WS_URL}?roomCode=${roomCode}&playerName=${encodeURIComponent(playerName)}&sessionToken=${sessionToken}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      attemptRef.current = 0;
      setConnectionStatus("connected");

      // Start ping interval
      pingTimerRef.current = setInterval(() => {
        sendMessage({ type: "ping" });
      }, WS_PING_INTERVAL);
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const msg: ServerMessage = JSON.parse(event.data);

        // Handle connection identity from room_state
        if (msg.type === "room_state") {
          // Find ourselves in the player list or spectator list
          const asPlayer = msg.room.players.find(
            (p) => p.name === playerName
          );
          if (asPlayer) {
            setMyPlayerId(asPlayer.id);
            setIsSpectator(false);
          } else {
            const asSpectator = msg.room.spectators.find(
              (s) => s.name === playerName
            );
            if (asSpectator) {
              setMyPlayerId(asSpectator.id);
              setIsSpectator(true);
            }
          }
        }

        handleServerMessage(msg);
      } catch (e) {
        console.error("[ArcadeKit] Failed to parse message:", e);
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      clearInterval(pingTimerRef.current);
      setConnectionStatus("disconnected");
      scheduleReconnect();
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, playerName, sessionToken, enabled]);

  const scheduleReconnect = useCallback(() => {
    if (attemptRef.current >= WS_RECONNECT_MAX_ATTEMPTS) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("reconnecting");

    const delay = Math.min(
      WS_RECONNECT_BASE_DELAY * Math.pow(2, attemptRef.current),
      WS_RECONNECT_MAX_DELAY
    );
    const jitter = Math.random() * delay * 0.3;
    attemptRef.current++;

    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, delay + jitter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled && roomCode && playerName && sessionToken) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      clearInterval(pingTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
      }
    };
  }, [connect, enabled, roomCode, playerName, sessionToken]);

  return { sendMessage, connectionStatus, sendAction };
}
