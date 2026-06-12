// ============================================================
// ArcadeKit — Reconnect Overlay
// Fullscreen overlay shown when WebSocket connection is lost.
// ============================================================

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { WifiOff, RefreshCw } from "lucide-react";

interface ReconnectOverlayProps {
  status: "connecting" | "reconnecting" | "disconnected";
  onRetry?: () => void;
}

export function ReconnectOverlay({ status, onRetry }: ReconnectOverlayProps) {
  const isDisconnected = status === "disconnected";

  return (
    <AnimatePresence>
      <motion.div
        key="reconnect-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-surface p-8 shadow-2xl"
        >
          {isDisconnected ? (
            <>
              {/* Disconnected state */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
                <WifiOff className="h-7 w-7 text-coral" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Connection Lost
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Unable to reach the game server
                </p>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-violet px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet/90 hover:shadow-lg hover:shadow-violet/25 active:translate-y-px"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              )}
            </>
          ) : (
            <>
              {/* Connecting / Reconnecting state */}
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full border-2 border-transparent animate-spin",
                    "border-t-violet border-r-violet/30"
                  )}
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {status === "reconnecting" ? "Reconnecting…" : "Connecting…"}
                </h3>
                {status === "reconnecting" && (
                  <p className="mt-1 text-sm text-text-secondary">
                    Attempting to restore connection
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
