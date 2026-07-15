"use client";

// ============================================================
// ArcadeKit — Spin Wheel Client Component
// Interactive SVG spinning wheel with customizable segments.
// ============================================================

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw, Pencil, Check, X } from "lucide-react";

// ── Constants ────────────────────────────────────────────────
const SEGMENT_COLORS = [
  "#F97316", // ember / orange
  "#3B82F6", // blue
  "#22C55E", // green
  "#EF4444", // red
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#10B981", // emerald
  "#6366F1", // indigo
  "#F43F5E", // rose
  "#14B8A6", // teal
  "#A855F7", // purple
  "#0EA5E9", // sky
  "#D946EF", // fuchsia
  "#84CC16", // lime
  "#FB923C", // orange-light
  "#2DD4BF", // teal-light
  "#818CF8", // indigo-light
  "#FBBF24", // yellow
];

const SPIN_DURATION = 4000; // ms
const MIN_ROTATIONS = 5;
const MAX_ROTATIONS = 8;

const WHEEL_RADIUS = 170;
const WHEEL_CENTER = 190;
const SVG_SIZE = 380;

// ── Helpers ──────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

// ── Confetti Particle ────────────────────────────────────────
function ConfettiParticle({ index }: { index: number }) {
  const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const size = 6 + Math.random() * 8;
  const drift = -50 + Math.random() * 100;

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        left: `${left}%`,
        top: "50%",
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        backgroundColor: color,
      }}
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: [0, -200 - Math.random() * 300],
        x: [0, drift],
        opacity: [1, 1, 0],
        rotate: [0, 360 + Math.random() * 720],
        scale: [1, 0.5],
      }}
      transition={{
        duration: 1.5 + Math.random() * 1,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

// ── Main Component ───────────────────────────────────────────
export default function SpinWheel() {
  const [options, setOptions] = useState<string[]>([
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
  ]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newOption, setNewOption] = useState("");

  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Segment geometry ───────────────────────────────────────
  const segmentAngle = 360 / options.length;

  const segments = useMemo(
    () =>
      options.map((label, i) => {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        const midAngle = startAngle + segmentAngle / 2;
        const path = describeArc(
          WHEEL_CENTER,
          WHEEL_CENTER,
          WHEEL_RADIUS,
          startAngle,
          endAngle
        );
        // Text position — slightly inward
        const textR = WHEEL_RADIUS * 0.62;
        const textPos = polarToCartesian(
          WHEEL_CENTER,
          WHEEL_CENTER,
          textR,
          midAngle
        );
        return {
          label,
          path,
          color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
          textPos,
          textRotation: midAngle,
        };
      }),
    [options, segmentAngle]
  );

  // ── Spin logic ─────────────────────────────────────────────
  const spin = useCallback(() => {
    if (spinning || options.length < 2) return;

    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    // Pick a random final angle
    const extraRotations =
      MIN_ROTATIONS + Math.random() * (MAX_ROTATIONS - MIN_ROTATIONS);
    const randomAngle = Math.random() * 360;
    const totalDegrees = extraRotations * 360 + randomAngle;
    const newRotation = rotation + totalDegrees;

    setRotation(newRotation);

    // Calculate result after spin completes
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = setTimeout(() => {
      // The pointer is at the top (0°). We need to figure out which
      // segment is under the pointer after the wheel stops.
      // normalizedAngle is how many degrees the wheel has been rotated
      // from its initial position, mod 360.
      const normalizedAngle = ((newRotation % 360) + 360) % 360;
      // The pointer is at the top. Because the wheel rotates clockwise,
      // the segment under the pointer is the one whose start angle
      // is at (360 - normalizedAngle). But since our segments start
      // from 0° going clockwise, we can compute the winning index.
      const pointerAngle = (360 - normalizedAngle + 360) % 360;
      const winningIndex =
        Math.floor(pointerAngle / segmentAngle) % options.length;

      setResult(options[winningIndex]);
      setSpinning(false);
      setShowConfetti(true);

      // Hide confetti after a few seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }, SPIN_DURATION + 100);
  }, [spinning, options, rotation, segmentAngle]);

  // ── Option management ──────────────────────────────────────
  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed || options.length >= 20) return;
    setOptions((prev) => [...prev, trimmed]);
    setNewOption("");
    setResult(null);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(options[index]);
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditingIndex(null);
      return;
    }
    setOptions((prev) =>
      prev.map((opt, i) => (i === editingIndex ? trimmed : opt))
    );
    setEditingIndex(null);
    setResult(null);
  };

  const resetWheel = () => {
    setOptions(["Option 1", "Option 2", "Option 3", "Option 4"]);
    setRotation(0);
    setResult(null);
    setShowConfetti(false);
  };

  return (
    <section className="relative px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* ── Header ────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Spin <span className="gradient-text">Wheel</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary md:text-base">
            Add your options, spin the wheel, and let randomness decide.
            Perfect for games, prizes, and tough decisions.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          {/* ── Wheel Column ────────────────────────────── */}
          <div className="flex flex-col items-center">
            {/* Wheel container */}
            <div className="relative">
              {/* Confetti */}
              <AnimatePresence>
                {showConfetti && (
                  <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <ConfettiParticle key={i} index={i} />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Pointer / Arrow */}
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon
                    points="16,28 6,4 26,4"
                    fill="#F97316"
                    stroke="#0B0D17"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* SVG Wheel */}
              <svg
                width={SVG_SIZE}
                height={SVG_SIZE}
                viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                className="max-w-full drop-shadow-[0_0_40px_rgba(249,115,22,0.15)]"
              >
                {/* Outer ring glow */}
                <circle
                  cx={WHEEL_CENTER}
                  cy={WHEEL_CENTER}
                  r={WHEEL_RADIUS + 6}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                />

                {/* Rotating group */}
                <g
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: `${WHEEL_CENTER}px ${WHEEL_CENTER}px`,
                    transition: spinning
                      ? `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.6, 0.35, 1)`
                      : "none",
                  }}
                >
                  {segments.map((seg, i) => (
                    <g key={`${i}-${seg.label}`}>
                      {/* Segment fill */}
                      <path
                        d={seg.path}
                        fill={seg.color}
                        stroke="#0B0D17"
                        strokeWidth="2"
                      />
                      {/* Segment label */}
                      <text
                        x={seg.textPos.x}
                        y={seg.textPos.y}
                        fill="white"
                        fontSize={options.length > 10 ? 10 : options.length > 6 ? 11 : 13}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                          pointerEvents: "none",
                        }}
                        transform={`rotate(${seg.textRotation}, ${seg.textPos.x}, ${seg.textPos.y})`}
                      >
                        {seg.label.length > 12
                          ? seg.label.slice(0, 11) + "…"
                          : seg.label}
                      </text>
                    </g>
                  ))}

                  {/* Center circle */}
                  <circle
                    cx={WHEEL_CENTER}
                    cy={WHEEL_CENTER}
                    r={22}
                    fill="#12152A"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                  />
                  <circle
                    cx={WHEEL_CENTER}
                    cy={WHEEL_CENTER}
                    r={8}
                    fill="#F97316"
                  />
                </g>
              </svg>
            </div>

            {/* Spin button */}
            <motion.button
              onClick={spin}
              disabled={spinning || options.length < 2}
              className="mt-6 inline-flex h-14 items-center gap-2.5 rounded-2xl bg-ember px-10 text-lg font-bold text-white shadow-lg shadow-ember/25 transition-all hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-50"
              whileTap={!spinning ? { scale: 0.95 } : undefined}
              whileHover={!spinning ? { scale: 1.03 } : undefined}
            >
              {spinning ? (
                <>
                  <motion.div
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                  />
                  Spinning…
                </>
              ) : (
                "🎡 Spin!"
              )}
            </motion.button>

            {/* Result display */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  className="mt-6 w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6 text-center"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Result
                  </p>
                  <p className="mt-2 font-heading text-2xl font-bold text-ember md:text-3xl">
                    {result}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Options Panel ───────────────────────────── */}
          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold">
                Options{" "}
                <span className="text-sm font-normal text-text-muted">
                  ({options.length}/20)
                </span>
              </h2>
              <button
                onClick={resetWheel}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-muted transition-colors hover:bg-white/5 hover:text-text-secondary"
                title="Reset to defaults"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Option list */}
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {options.map((opt, i) => (
                  <motion.div
                    key={`${i}-${opt}`}
                    className="group flex items-center gap-2 rounded-xl border border-white/5 bg-elevated/60 px-3 py-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    layout
                  >
                    {/* Color dot */}
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                      }}
                    />

                    {editingIndex === i ? (
                      <>
                        <input
                          ref={inputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") setEditingIndex(null);
                          }}
                          className="min-w-0 flex-1 rounded-md bg-midnight px-2 py-1 text-sm text-text-primary outline-none ring-1 ring-ember/50"
                          maxLength={30}
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-1 text-text-muted hover:text-text-secondary"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                          {opt}
                        </span>
                        <button
                          onClick={() => startEditing(i)}
                          className="p-1 text-text-muted opacity-0 transition-opacity hover:text-text-secondary group-hover:opacity-100"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeOption(i)}
                          disabled={options.length <= 2}
                          className="p-1 text-text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add option */}
            {options.length < 20 && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addOption();
                  }}
                  placeholder="Add option…"
                  className="min-w-0 flex-1 rounded-xl border border-white/5 bg-elevated/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-ember/50 focus:ring-1 focus:ring-ember/30"
                  maxLength={30}
                />
                <motion.button
                  onClick={addOption}
                  disabled={!newOption.trim()}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-ember text-white transition-colors hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
