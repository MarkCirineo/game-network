"use client";

// ============================================================
// ArcadeKit — Battleship Board Generator (Client Component)
// Single-board random ship placement + printable blank grids.
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  RotateCcw,
  Printer,
  Ship,
  Grid3X3,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────── */
interface ShipDef {
  name: string;
  size: number;
  color: string;
}

interface PlacedShip {
  ship: ShipDef;
  cells: [number, number][];
}

type CellState = null | string; // null = water, string = ship name

/* ── Fleet definition ────────────────────────────────────── */
const FLEET: ShipDef[] = [
  { name: "Carrier", size: 5, color: "#3B82F6" },
  { name: "Battleship", size: 4, color: "#F97316" },
  { name: "Cruiser", size: 3, color: "#A855F7" },
  { name: "Submarine", size: 3, color: "#22C55E" },
  { name: "Destroyer", size: 2, color: "#EF4444" },
];

const ROWS = "ABCDEFGHIJ".split("");
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

/* ── Board generation logic ──────────────────────────────── */
function createEmptyGrid(): CellState[][] {
  return Array.from({ length: 10 }, () => Array(10).fill(null) as CellState[]);
}

/**
 * Checks whether a ship can be placed at the given position.
 * Enforces a 1-cell buffer around every ship so no two ships touch
 * (not even diagonally), which matches how most people play.
 */
function canPlace(
  grid: CellState[][],
  row: number,
  col: number,
  size: number,
  horizontal: boolean
): boolean {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;

    // Out of bounds
    if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;

    // Check the cell itself and all 8 surrounding cells for conflicts
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
          if (grid[nr][nc] !== null) return false;
        }
      }
    }
  }
  return true;
}

function placeShipsRandomly(): { grid: CellState[][]; placements: PlacedShip[] } {
  const grid = createEmptyGrid();
  const placements: PlacedShip[] = [];

  for (const ship of FLEET) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 1000) {
      attempts++;
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);

      if (canPlace(grid, row, col, ship.size, horizontal)) {
        const cells: [number, number][] = [];
        for (let i = 0; i < ship.size; i++) {
          const r = horizontal ? row : row + i;
          const c = horizontal ? col + i : col;
          grid[r][c] = ship.name;
          cells.push([r, c]);
        }
        placements.push({ ship, cells });
        placed = true;
      }
    }

    // Retry the whole board if placement fails (extremely rare with buffer)
    if (!placed) {
      return placeShipsRandomly();
    }
  }

  return { grid, placements };
}

/* ── On-screen grid component ────────────────────────────── */
function BoardGrid({
  grid,
  placements,
  animDelay = 0,
}: {
  grid: CellState[][];
  placements: PlacedShip[];
  animDelay?: number;
}) {
  const colorMap: Record<string, ShipDef> = {};
  for (const p of placements) {
    colorMap[p.ship.name] = p.ship;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.4 }}
      className="flex justify-center"
    >
      <div className="inline-block">
        {/* Column headers */}
        <div className="flex">
          <div className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
          {COLS.map((col) => (
            <div
              key={col}
              className="flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold text-text-muted sm:h-8 sm:w-8 sm:text-xs"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {ROWS.map((rowLabel, rowIdx) => (
          <div key={rowLabel} className="flex">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold text-text-muted sm:h-8 sm:w-8 sm:text-xs">
              {rowLabel}
            </div>
            {grid[rowIdx].map((cell, colIdx) => {
              const ship = cell ? colorMap[cell] : null;
              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: animDelay + (rowIdx * 10 + colIdx) * 0.005,
                    duration: 0.2,
                  }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center border sm:h-8 sm:w-8 ${
                    ship ? "" : "border-white/5 bg-midnight/40"
                  } transition-colors`}
                  style={
                    ship
                      ? {
                          backgroundColor: `${ship.color}22`,
                          borderColor: `${ship.color}40`,
                        }
                      : undefined
                  }
                >
                  {ship && (
                    <div
                      className="h-3 w-3 rounded-sm sm:h-3.5 sm:w-3.5"
                      style={{ backgroundColor: `${ship.color}80` }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Printable grid (table-based for clean print output) ── */
function PrintableGrid({
  grid,
  showShips,
}: {
  grid: CellState[][] | null;
  showShips: boolean;
}) {
  return (
    <table className="bs-print-grid">
      <thead>
        <tr>
          <th className="bs-corner" />
          {COLS.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((rowLabel, rowIdx) => (
          <tr key={rowLabel}>
            <th>{rowLabel}</th>
            {Array.from({ length: 10 }).map((_, colIdx) => {
              const hasShip =
                showShips && grid !== null && grid[rowIdx][colIdx] !== null;
              return (
                <td
                  key={colIdx}
                  style={hasShip ? { background: "#ccc" } : undefined}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export function BattleshipBoard() {
  const [board, setBoard] = useState<{
    grid: CellState[][];
    placements: PlacedShip[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [printMode, setPrintMode] = useState<"blank" | "ships" | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setBoard(null);
    await new Promise((r) => setTimeout(r, 500));
    const result = placeShipsRandomly();
    setBoard(result);
    setAnimKey((k) => k + 1);
    setIsGenerating(false);
  }, []);

  // Reset print mode after the print dialog closes
  useEffect(() => {
    const reset = () => setPrintMode(null);
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  const triggerPrint = useCallback((mode: "blank" | "ships") => {
    setPrintMode(mode);
    // Give React time to render the print DOM before firing print
    setTimeout(() => {
      window.print();
    }, 300);
  }, []);

  const handlePrintBlank = useCallback(() => triggerPrint("blank"), [triggerPrint]);
  const handlePrintWithShips = useCallback(() => triggerPrint("ships"), [triggerPrint]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Controls ────────────────────────────────────── */}
      <div className="bs-screen-only rounded-2xl border border-white/5 bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex h-11 items-center gap-2 rounded-xl bg-ember px-6 text-sm font-semibold text-white transition-all hover:bg-ember/90 hover:shadow-lg hover:shadow-ember/25 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    ease: "linear",
                  }}
                >
                  <Anchor className="h-4 w-4" />
                </motion.div>
                Placing Ships…
              </>
            ) : board ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Regenerate
              </>
            ) : (
              <>
                <Ship className="h-4 w-4" />
                Generate Board
              </>
            )}
          </button>

          {/* Print Blank — always available */}
          <button
            onClick={handlePrintBlank}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-elevated px-4 text-sm font-medium text-text-secondary transition-all hover:border-white/20 hover:text-text-primary"
          >
            <Grid3X3 className="h-4 w-4" />
            Print Blank Grids
          </button>

          {/* Print With Ships — only when a board is generated */}
          {board && (
            <button
              onClick={handlePrintWithShips}
              className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-elevated px-4 text-sm font-medium text-text-secondary transition-all hover:border-white/20 hover:text-text-primary"
            >
              <Printer className="h-4 w-4" />
              Print with Ships
            </button>
          )}
        </div>
      </div>

      {/* ── Generation animation ────────────────────────── */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bs-screen-only flex items-center justify-center py-12"
          >
            <div className="flex gap-2">
              {FLEET.map((ship, i) => (
                <motion.div
                  key={ship.name}
                  className="flex items-center gap-0.5"
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {Array.from({ length: ship.size }).map((_, j) => (
                    <div
                      key={j}
                      className="h-5 w-5 rounded-sm"
                      style={{ backgroundColor: `${ship.color}60` }}
                    />
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── On-screen board (single) ──────────────────────── */}
      <AnimatePresence>
        {board && !isGenerating && (
          <motion.div
            key={animKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bs-screen-only space-y-6"
          >
            <div className="rounded-2xl border border-white/5 bg-surface p-4 sm:p-5">
              <h3 className="mb-3 text-center font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
                Your Ship Placement
              </h3>
              <BoardGrid grid={board.grid} placements={board.placements} />
            </div>

            {/* Ship Legend */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-white/5 bg-surface p-5"
            >
              <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
                Fleet Legend
              </h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {FLEET.map((ship) => (
                  <div key={ship.name} className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: ship.size }).map((_, i) => (
                        <div
                          key={i}
                          className="h-4 w-4 rounded-sm"
                          style={{ backgroundColor: `${ship.color}60` }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-secondary">
                      {ship.name}{" "}
                      <span className="text-text-muted">({ship.size})</span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ─────────────────────────────────── */}
      {!board && !isGenerating && (
        <div className="bs-screen-only rounded-2xl border border-white/5 bg-surface p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ember/10">
            <Ship className="h-7 w-7 text-ember" />
          </div>
          <p className="text-sm text-text-secondary">
            Click{" "}
            <strong className="text-text-primary">Generate Board</strong> to
            randomly place ships, or{" "}
            <strong className="text-text-primary">Print Blank Grids</strong> to
            get printable sheets for paper play.
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Standard fleet: Carrier (5), Battleship (4), Cruiser (3), Submarine
            (3), Destroyer (2)
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PRINT-ONLY CONTENT
          Rendered when printMode is set. Hidden on screen via CSS.
          Contains 4 grids: 2 per player (My Ships + Shot Tracker).
          ══════════════════════════════════════════════════════ */}
      {printMode && (
        <div className="bs-print-page">
          {/* ── Page 1: Player 1 ── */}
          <div className="bs-print-player-page">
            <div className="bs-print-player-title">Player 1</div>
            <div className="bs-print-grids">
              <div className="bs-print-grid-block">
                <div className="bs-print-label">My Ships</div>
                <PrintableGrid
                  grid={printMode === "ships" ? board?.grid ?? null : null}
                  showShips={printMode === "ships"}
                />
              </div>
              <div className="bs-print-grid-block">
                <div className="bs-print-label">Shot Tracker</div>
                <PrintableGrid grid={null} showShips={false} />
              </div>
            </div>
            <div className="bs-print-page-footer">
              <div className="bs-print-fleet">
                {FLEET.map((ship, i) => (
                  <span key={ship.name}>
                    {ship.name} ({ship.size})
                    {i < FLEET.length - 1 && " · "}
                  </span>
                ))}
              </div>
              <div className="bs-print-brand">arcadekit.games</div>
            </div>
          </div>

          {/* ── Page 2: Player 2 ── */}
          <div className="bs-print-player-page">
            <div className="bs-print-player-title">Player 2</div>
            <div className="bs-print-grids">
              <div className="bs-print-grid-block">
                <div className="bs-print-label">My Ships</div>
                <PrintableGrid grid={null} showShips={false} />
              </div>
              <div className="bs-print-grid-block">
                <div className="bs-print-label">Shot Tracker</div>
                <PrintableGrid grid={null} showShips={false} />
              </div>
            </div>
            <div className="bs-print-page-footer">
              <div className="bs-print-fleet">
                {FLEET.map((ship, i) => (
                  <span key={ship.name}>
                    {ship.name} ({ship.size})
                    {i < FLEET.length - 1 && " · "}
                  </span>
                ))}
              </div>
              <div className="bs-print-brand">arcadekit.games</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Styles ───────────────────────────────────────── */}
      <style>{`
        /* ── Screen: hide the print page ── */
        .bs-print-page {
          display: none;
        }

        /* ── Print media ── */
        @media print {
          /* Hide everything on screen */
          .bs-screen-only,
          header,
          footer,
          nav {
            display: none !important;
          }

          /* Reset page */
          @page {
            size: portrait;
            margin: 10mm;
          }

          html, body {
            background: white !important;
            color: black !important;
          }

          /* Show the print page */
          .bs-print-page {
            display: block !important;
          }

          /* Each player gets their own printed page */
          .bs-print-player-page {
            page-break-after: always;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: calc(100vh - 20mm);
          }

          .bs-print-player-page:last-child {
            page-break-after: auto;
          }

          .bs-print-player-title {
            font-size: 16pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #111;
            margin-bottom: 4mm;
            align-self: flex-start;
          }

          /* Stacked grids, centered */
          .bs-print-grids {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6mm;
            width: 100%;
          }

          .bs-print-grid-block {
            width: 75%;
            max-width: 130mm;
          }

          .bs-print-label {
            font-size: 9pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #555;
            margin-bottom: 2mm;
          }

          /* Grid table */
          .bs-print-grid {
            border-collapse: collapse;
            width: 100%;
          }

          .bs-print-grid th,
          .bs-print-grid td {
            border: 1px solid #888;
            text-align: center;
            vertical-align: middle;
            font-size: 7pt;
            font-weight: 600;
            padding: 0;
            width: calc(100% / 11);
            height: 7mm;
          }

          .bs-print-grid th {
            border: none;
            color: #555;
            height: 5mm;
          }

          .bs-corner {
            border: none !important;
          }

          .bs-print-grid td {
            background: white;
            /* Force ship-cell backgrounds to print even when the browser's
               "background graphics" print setting is off (the default) */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Page footer (fleet legend + branding) */
          .bs-print-page-footer {
            margin-top: auto;
            padding-top: 4mm;
            width: 100%;
          }

          .bs-print-fleet {
            text-align: center;
            font-size: 8pt;
            color: #666;
          }

          .bs-print-brand {
            text-align: center;
            font-size: 8pt;
            color: #bbb;
            letter-spacing: 0.15em;
            margin-top: 2mm;
          }
        }
      `}</style>
    </div>
  );
}
