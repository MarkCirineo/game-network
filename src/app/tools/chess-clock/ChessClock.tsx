"use client";

// ============================================================
// ArcadeKit — Chess Clock (Client Component)
// Two-player chess clock with presets, increment, fullscreen,
// move counters, and Web Audio API beep on time expiry.
// ============================================================

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Pause,
  Play,
  RotateCcw,
  Maximize,
  Volume2,
  VolumeOff,
  Settings,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

type GameState = "idle" | "running" | "paused" | "finished";
type ActivePlayer = 1 | 2;

interface TimeControl {
  label: string;
  minutes: number;
  increment: number;
}

/* ── Constants ──────────────────────────────────────────── */

const PRESETS: TimeControl[] = [
  { label: "Bullet", minutes: 1, increment: 0 },
  { label: "Blitz", minutes: 3, increment: 2 },
  { label: "Rapid", minutes: 10, increment: 5 },
  { label: "Classical", minutes: 30, increment: 0 },
];

/* ── Helpers ────────────────────────────────────────────── */

function formatClockTime(ms: number): string {
  if (ms <= 0) return "0:00.0";
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds * 10) % 10);

  if (minutes >= 10) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;
}

function playBeep(audioCtx: AudioContext | null) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 880;
    osc.type = "square";
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.5);
  } catch {
    // Web Audio may not be available in all contexts
  }
}

/* ── Component ──────────────────────────────────────────── */

export function ChessClock() {
  // Time control config
  const [selectedPreset, setSelectedPreset] = useState<string>("Blitz");
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customIncrement, setCustomIncrement] = useState(3);
  const [showCustom, setShowCustom] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [activePlayer, setActivePlayer] = useState<ActivePlayer>(1);
  const [time1, setTime1] = useState(3 * 60 * 1000); // ms
  const [time2, setTime2] = useState(3 * 60 * 1000);
  const [moves1, setMoves1] = useState(0);
  const [moves2, setMoves2] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const beeped1Ref = useRef(false);
  const beeped2Ref = useRef(false);

  // Get current time control values
  const getTimeControl = useCallback((): { minutes: number; increment: number } => {
    if (showCustom) return { minutes: customMinutes, increment: customIncrement };
    const preset = PRESETS.find((p) => p.label === selectedPreset);
    return preset ? { minutes: preset.minutes, increment: preset.increment } : { minutes: 3, increment: 2 };
  }, [showCustom, customMinutes, customIncrement, selectedPreset]);

  // Initialize audio context on first interaction
  const ensureAudioCtx = useCallback(() => {
    if (!audioCtxRef.current && typeof AudioContext !== "undefined") {
      audioCtxRef.current = new AudioContext();
    }
  }, []);

  // Start/resume the clock
  const startClock = useCallback(() => {
    ensureAudioCtx();
    if (gameState === "idle") {
      const tc = getTimeControl();
      const ms = tc.minutes * 60 * 1000;
      setTime1(ms);
      setTime2(ms);
      setMoves1(0);
      setMoves2(0);
      beeped1Ref.current = false;
      beeped2Ref.current = false;
    }
    setGameState("running");
    lastTickRef.current = performance.now();
  }, [gameState, getTimeControl, ensureAudioCtx]);

  // Pause
  const pauseClock = useCallback(() => {
    setGameState("paused");
  }, []);

  // Reset
  const resetClock = useCallback(() => {
    setGameState("idle");
    const tc = getTimeControl();
    const ms = tc.minutes * 60 * 1000;
    setTime1(ms);
    setTime2(ms);
    setMoves1(0);
    setMoves2(0);
    setActivePlayer(1);
    beeped1Ref.current = false;
    beeped2Ref.current = false;
  }, [getTimeControl]);

  // Switch player (tap to end your turn)
  const switchPlayer = useCallback(() => {
    if (gameState !== "running") return;
    const tc = getTimeControl();
    const inc = tc.increment * 1000;

    if (activePlayer === 1) {
      setTime1((prev) => prev + inc);
      setMoves1((prev) => prev + 1);
      setActivePlayer(2);
    } else {
      setTime2((prev) => prev + inc);
      setMoves2((prev) => prev + 1);
      setActivePlayer(1);
    }
    lastTickRef.current = performance.now();
  }, [gameState, activePlayer, getTimeControl]);

  // Timer tick
  useEffect(() => {
    if (gameState !== "running") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (activePlayer === 1) {
        setTime1((prev) => {
          const next = Math.max(0, prev - delta);
          if (next <= 0 && !beeped1Ref.current) {
            beeped1Ref.current = true;
            if (soundEnabled) playBeep(audioCtxRef.current);
            setGameState("finished");
          }
          return next;
        });
      } else {
        setTime2((prev) => {
          const next = Math.max(0, prev - delta);
          if (next <= 0 && !beeped2Ref.current) {
            beeped2Ref.current = true;
            if (soundEnabled) playBeep(audioCtxRef.current);
            setGameState("finished");
          }
          return next;
        });
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState, activePlayer, soundEnabled]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Select preset
  const selectPreset = (label: string) => {
    if (gameState !== "idle") return;
    setSelectedPreset(label);
    setShowCustom(false);
    const preset = PRESETS.find((p) => p.label === label)!;
    const ms = preset.minutes * 60 * 1000;
    setTime1(ms);
    setTime2(ms);
  };

  const selectCustom = () => {
    if (gameState !== "idle") return;
    setShowCustom(true);
    setSelectedPreset("");
    const ms = customMinutes * 60 * 1000;
    setTime1(ms);
    setTime2(ms);
  };

  // Determine timer urgency classes
  const getTimerClasses = (ms: number, isActive: boolean, player: ActivePlayer) => {
    const base = "relative flex flex-1 flex-col items-center justify-center rounded-2xl border p-6 transition-all cursor-pointer select-none";

    if (gameState === "finished" && ms <= 0) {
      return `${base} border-red-500/50 bg-red-500/10 animate-pulse`;
    }

    if (!isActive || gameState !== "running") {
      return `${base} border-white/5 bg-surface`;
    }

    // Active player
    if (ms < 10_000) {
      return `${base} border-red-500/50 bg-red-500/8 shadow-lg shadow-red-500/10`;
    }
    if (ms < 30_000) {
      return `${base} border-amber-500/40 bg-amber-500/5`;
    }
    return `${base} border-ember/40 bg-ember/5`;
  };

  const getTimeColor = (ms: number, isActive: boolean) => {
    if (ms <= 0) return "text-red-500";
    if (isActive && ms < 10_000) return "text-red-400";
    if (isActive && ms < 30_000) return "text-amber-400";
    if (isActive) return "text-text-primary";
    return "text-text-secondary";
  };

  const tc = getTimeControl();
  const isRunning = gameState === "running";
  const isIdle = gameState === "idle";

  return (
    <section className="px-4 py-8 md:py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-ember/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* ── Header ──────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            <Clock className="h-4 w-4 text-ember" />
            Free Tool
          </div>
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Chess <span className="gradient-text">Clock</span>
          </h1>
          <p className="mt-2 text-text-secondary">
            Professional chess timer with presets, increment, and fullscreen
            mode.
          </p>
        </div>

        {/* ── Time Control Presets ─────────────────────── */}
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => selectPreset(p.label)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    selectedPreset === p.label && !showCustom
                      ? "border-ember/60 bg-ember/15 text-ember"
                      : "border-white/10 bg-surface text-text-secondary hover:border-white/20 hover:text-text-primary"
                  }`}
                >
                  <div className="font-bold">{p.label}</div>
                  <div className="text-xs opacity-70">
                    {p.minutes}+{p.increment}
                  </div>
                </button>
              ))}
              <button
                onClick={selectCustom}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  showCustom
                    ? "border-ember/60 bg-ember/15 text-ember"
                    : "border-white/10 bg-surface text-text-secondary hover:border-white/20 hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <Settings className="h-3.5 w-3.5" />
                  Custom
                </div>
              </button>
            </div>

            {/* Custom inputs */}
            <AnimatePresence>
              {showCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="mx-auto flex max-w-sm items-end justify-center gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Minutes
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={customMinutes}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(180, parseInt(e.target.value) || 1));
                          setCustomMinutes(v);
                          setTime1(v * 60 * 1000);
                          setTime2(v * 60 * 1000);
                        }}
                        className="w-24 rounded-lg border border-white/10 bg-elevated px-3 py-2 text-center font-heading text-lg font-bold text-text-primary outline-none focus:border-ember/50"
                      />
                    </div>
                    <div className="pb-2 text-2xl text-text-muted">+</div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Increment (sec)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={customIncrement}
                        onChange={(e) => {
                          setCustomIncrement(
                            Math.max(0, Math.min(60, parseInt(e.target.value) || 0))
                          );
                        }}
                        className="w-24 rounded-lg border border-white/10 bg-elevated px-3 py-2 text-center font-heading text-lg font-bold text-text-primary outline-none focus:border-ember/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Clock Display ───────────────────────────── */}
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Player 1 */}
          <div
            onClick={() => {
              if (gameState === "idle") startClock();
              else if (activePlayer === 1) switchPlayer();
            }}
            className={getTimerClasses(time1, activePlayer === 1, 1)}
          >
            {/* Player label */}
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Player 1
              {gameState === "running" && activePlayer === 1 && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2 inline-block h-2 w-2 rounded-full bg-ember"
                />
              )}
            </div>

            {/* Time */}
            <div
              className={`font-heading text-6xl font-bold tabular-nums md:text-7xl ${getTimeColor(
                time1,
                activePlayer === 1
              )}`}
            >
              {formatClockTime(time1)}
            </div>

            {/* Move counter */}
            <div className="mt-2 text-sm text-text-muted">
              {moves1} move{moves1 !== 1 ? "s" : ""}
            </div>

            {/* Active indicator bar */}
            {gameState === "running" && activePlayer === 1 && (
              <motion.div
                layoutId="active-bar"
                className="absolute bottom-0 left-[10%] right-[10%] h-1 rounded-full bg-ember"
              />
            )}
          </div>

          {/* Player 2 */}
          <div
            onClick={() => {
              if (gameState === "idle") startClock();
              else if (activePlayer === 2) switchPlayer();
            }}
            className={getTimerClasses(time2, activePlayer === 2, 2)}
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Player 2
              {gameState === "running" && activePlayer === 2 && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2 inline-block h-2 w-2 rounded-full bg-ember"
                />
              )}
            </div>

            <div
              className={`font-heading text-6xl font-bold tabular-nums md:text-7xl ${getTimeColor(
                time2,
                activePlayer === 2
              )}`}
            >
              {formatClockTime(time2)}
            </div>

            <div className="mt-2 text-sm text-text-muted">
              {moves2} move{moves2 !== 1 ? "s" : ""}
            </div>

            {gameState === "running" && activePlayer === 2 && (
              <motion.div
                layoutId="active-bar"
                className="absolute bottom-0 left-[10%] right-[10%] h-1 rounded-full bg-ember"
              />
            )}
          </div>
        </div>

        {/* ── Finished Banner ─────────────────────────── */}
        <AnimatePresence>
          {gameState === "finished" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center"
            >
              <div className="font-heading text-xl font-bold text-red-400">
                ⏰ Time&apos;s Up!
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                {time1 <= 0 ? "Player 2" : "Player 1"} wins on time
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Controls ────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {/* Play / Pause */}
          {gameState === "idle" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startClock}
              className="flex items-center gap-2 rounded-xl bg-ember px-8 py-3 text-base font-bold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
            >
              <Play className="h-5 w-5" />
              Start
            </motion.button>
          )}

          {gameState === "running" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={pauseClock}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface px-8 py-3 text-base font-bold text-text-primary transition-all hover:border-white/20"
            >
              <Pause className="h-5 w-5" />
              Pause
            </motion.button>
          )}

          {gameState === "paused" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startClock}
              className="flex items-center gap-2 rounded-xl bg-ember px-8 py-3 text-base font-bold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25"
            >
              <Play className="h-5 w-5" />
              Resume
            </motion.button>
          )}

          {/* Reset */}
          <button
            onClick={resetClock}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeOff className="h-5 w-5" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
            title="Fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>

        {/* ── Current time control info ────────────────── */}
        <div className="mt-6 text-center text-sm text-text-muted">
          {showCustom
            ? `Custom: ${customMinutes} min + ${customIncrement}s increment`
            : `${selectedPreset}: ${tc.minutes} min${tc.increment ? ` + ${tc.increment}s increment` : ""}`}
        </div>
      </div>
    </section>
  );
}
