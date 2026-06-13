// ============================================================
// ArcadeKit — WebSocket Client Hook
// Manages connection, reconnection, and message dispatching.
// ============================================================

"use client";

import { useEffect, useRef, useCallback } from "react";
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

  // Keep ALL mutable values in refs to avoid dependency churn
  const roomCodeRef = useRef(roomCode);
  const playerNameRef = useRef(playerName);
  const sessionTokenRef = useRef(sessionToken);
  const enabledRef = useRef(enabled);

  roomCodeRef.current = roomCode;
  playerNameRef.current = playerName;
  sessionTokenRef.current = sessionToken;
  enabledRef.current = enabled;

  const connectionStatus = useGameStore((s) => s.connectionStatus);

  // Store zustand actions in refs so they don't cause re-renders of callbacks
  const storeActionsRef = useRef({
    setConnectionStatus: useGameStore.getState().setConnectionStatus,
    handleServerMessage: useGameStore.getState().handleServerMessage,
    setMyPlayerId: useGameStore.getState().setMyPlayerId,
    setIsSpectator: useGameStore.getState().setIsSpectator,
  });

  // Keep store actions ref current (they're stable in Zustand, but this is defensive)
  useEffect(() => {
    return useGameStore.subscribe((state) => {
      storeActionsRef.current = {
        setConnectionStatus: state.setConnectionStatus,
        handleServerMessage: state.handleServerMessage,
        setMyPlayerId: state.setMyPlayerId,
        setIsSpectator: state.setIsSpectator,
      };
    });
  }, []);

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

  // All connection logic is ref-based — no React dependency churn
  const scheduleReconnect = useRef(() => {
    if (attemptRef.current >= WS_RECONNECT_MAX_ATTEMPTS) {
      storeActionsRef.current.setConnectionStatus("disconnected");
      return;
    }

    storeActionsRef.current.setConnectionStatus("reconnecting");

    const delay = Math.min(
      WS_RECONNECT_BASE_DELAY * Math.pow(2, attemptRef.current),
      WS_RECONNECT_MAX_DELAY
    );
    const jitter = Math.random() * delay * 0.3;
    attemptRef.current++;

    reconnectTimerRef.current = setTimeout(() => {
      connectFn.current();
    }, delay + jitter);
  });

  const connectFn = useRef(() => {
    if (!mountedRef.current || !enabledRef.current) return;

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

    const actions = storeActionsRef.current;
    actions.setConnectionStatus(attemptRef.current === 0 ? "connecting" : "reconnecting");

    const currentPlayerName = playerNameRef.current;
    const url = `${WS_URL}?roomCode=${roomCodeRef.current}&playerName=${encodeURIComponent(currentPlayerName)}&sessionToken=${sessionTokenRef.current}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      attemptRef.current = 0;
      storeActionsRef.current.setConnectionStatus("connected");

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
          const currentActions = storeActionsRef.current;
          const asPlayer = msg.room.players.find(
            (p) => p.name === currentPlayerName
          );
          if (asPlayer) {
            currentActions.setMyPlayerId(asPlayer.id);
            currentActions.setIsSpectator(false);
          } else {
            const asSpectator = msg.room.spectators.find(
              (s) => s.name === currentPlayerName
            );
            if (asSpectator) {
              currentActions.setMyPlayerId(asSpectator.id);
              currentActions.setIsSpectator(true);
            }
          }
        }

        storeActionsRef.current.handleServerMessage(msg);
      } catch (e) {
        console.error("[ArcadeKit] Failed to parse message:", e);
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      clearInterval(pingTimerRef.current);
      storeActionsRef.current.setConnectionStatus("disconnected");
      scheduleReconnect.current();
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  });

  // Single effect: connect when enabled, clean up on unmount
  useEffect(() => {
    mountedRef.current = true;
    if (enabled && roomCode && playerName && sessionToken) {
      connectFn.current();
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
  // These are the ONLY real triggers: when the user joins (enabled/playerName change)
  // or switches rooms (roomCode changes). sessionToken is per-tab, stable.
  }, [enabled, roomCode, playerName, sessionToken]);

  return { sendMessage, connectionStatus, sendAction };
}
