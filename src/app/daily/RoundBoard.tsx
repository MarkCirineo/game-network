"use client";

// ============================================================
// ArcadeKit — Daily Rank: putting five items in order
// Phone-first: tap one item, then another, to swap them. On any
// screen the grip on the left can be dragged too.
// ============================================================

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayEmoji } from "@/lib/daily/emoji";
import type { PublicItem, PublicRound } from "@/lib/daily/types";

function Row({
  item,
  position,
  selected,
  onTap,
  disabled,
}: {
  item: PublicItem;
  position: number;
  selected: boolean;
  onTap: () => void;
  disabled: boolean;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item.id}
      dragListener={false}
      dragControls={controls}
      className="list-none"
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-surface pr-3 transition-colors",
          selected ? "border-ember bg-ember/10" : "border-white/10",
        )}
      >
        <span
          onPointerDown={(e) => !disabled && controls.start(e)}
          className="flex h-14 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-text-muted active:cursor-grabbing"
          aria-hidden
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <button
          type="button"
          onClick={onTap}
          disabled={disabled}
          aria-pressed={selected}
          aria-label={`${position}. ${item.name}${selected ? " (selected, tap another item to swap)" : ""}`}
          className="flex min-h-14 flex-1 items-center gap-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ember/60 rounded-lg"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-text-secondary">
            {position}
          </span>
          {displayEmoji(item.emoji) && <span className="text-xl leading-none">{item.emoji}</span>}
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">{item.name}</span>
            {item.detail && <span className="block truncate text-xs text-text-secondary">{item.detail}</span>}
          </span>
        </button>
      </div>
    </Reorder.Item>
  );
}

export function RoundBoard({
  round,
  order,
  onChange,
  disabled,
}: {
  round: PublicRound;
  order: string[];
  onChange: (order: string[]) => void;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const byId = new Map(round.items.map((item) => [item.id, item]));

  const tap = (id: string) => {
    if (!selected) return setSelected(id);
    if (selected === id) return setSelected(null);
    const next = [...order];
    const a = next.indexOf(selected);
    const b = next.indexOf(id);
    [next[a], next[b]] = [next[b], next[a]];
    onChange(next);
    setSelected(null);
  };

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-cyan">
        <ArrowUp className="h-4 w-4" /> {round.top}
      </p>
      <Reorder.Group axis="y" values={order} onReorder={onChange} className="space-y-2">
        {order.map((id, index) => (
          <Row
            key={id}
            item={byId.get(id)!}
            position={index + 1}
            selected={selected === id}
            onTap={() => tap(id)}
            disabled={disabled}
          />
        ))}
      </Reorder.Group>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
        <ArrowDown className="h-4 w-4" /> {round.bottom}
      </p>
      <p className="mt-3 text-center text-xs text-text-muted">
        {selected ? "Now tap the item to swap it with." : "Tap two items to swap them, or drag the grip."}
      </p>
    </div>
  );
}
