"use client";

import { useState } from "react";
import { ActivityFeed } from "@/components/activity-feed";
import { cn } from "@/lib/cn";
import type { ActivityView } from "@/lib/view";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "in", label: "Money in" },
  { id: "out", label: "Money out" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

export function ActivityFilters({ items }: { items: ActivityView[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown =
    filter === "all" ? items : items.filter((i) => i.direction === filter);

  return (
    <div className="flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Show"
        className="grid grid-cols-3 rounded-full border border-line bg-surface p-0.5 text-sm"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full py-2 transition-colors",
              filter === f.id
                ? "bg-accent text-accent-ink"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length > 0 && shown.length === 0 ? (
        <div className="rounded-md border border-line bg-surface p-6 text-center text-sm text-ink-soft">
          Nothing here yet.
        </div>
      ) : (
        <ActivityFeed items={shown} />
      )}
    </div>
  );
}
