"use client";

import { useState } from "react";
import { MoneyAmount } from "@/components/money-amount";
import { formatShortDay } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { CashflowView, CashflowWeekView } from "@/lib/view";

/**
 * Money in vs out, week by week. Paired bars (in = --viz-in, out = --viz-out,
 * a validated colour pair), baseline only, values in the readout rather than
 * on every bar. Hover, tap or tab to a week to read it; a hidden table
 * carries the same numbers for screen readers.
 */
export function CashflowCard({ cashflow }: { cashflow: CashflowView }) {
  const [active, setActive] = useState<number | null>(null);
  const { weeks } = cashflow;
  const max = Math.max(1, ...weeks.map((w) => Math.max(w.inMinor, w.outMinor)));
  const empty = cashflow.inMinor === 0 && cashflow.outMinor === 0;
  const focus = active === null ? null : weeks[active];

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-ink-soft">Cash flow</h2>
        <p className="text-xs text-ink-faint" aria-live="polite">
          {focus
            ? `Week of ${formatShortDay(focus.weekStart)}`
            : `Last ${weeks.length} weeks`}
        </p>
      </div>

      {/* Totals double as the legend: swatch + label + value. */}
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <Total
          label="Money in"
          swatch="bg-viz-in"
          minor={focus ? focus.inMinor : cashflow.inMinor}
        />
        <Total
          label="Money out"
          swatch="bg-viz-out"
          minor={focus ? focus.outMinor : cashflow.outMinor}
        />
      </dl>

      {empty ? (
        <p className="mt-4 rounded-md bg-surface-sunk px-3 py-6 text-center text-sm text-ink-soft">
          Nothing in or out yet. Your weekly totals will chart here.
        </p>
      ) : (
        <>
          <div
            className="mt-4 grid h-28 border-b border-line"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
            onMouseLeave={() => setActive(null)}
          >
            {weeks.map((w, i) => (
              <button
                key={w.weekStart.toISOString()}
                type="button"
                aria-label={weekLabel(w)}
                aria-pressed={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                className={cn(
                  "flex h-full items-end justify-center gap-0.5 rounded-t-md transition-colors",
                  active === i && "bg-surface-sunk",
                )}
              >
                <Bar minor={w.inMinor} max={max} className="bg-viz-in" />
                <Bar minor={w.outMinor} max={max} className="bg-viz-out" />
              </button>
            ))}
          </div>
          <div
            className="mt-1.5 grid text-center text-[0.65rem] text-ink-faint"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
            aria-hidden="true"
          >
            {weeks.map((w) => (
              <span key={w.weekStart.toISOString()}>
                {formatShortDay(w.weekStart)}
              </span>
            ))}
          </div>

          <table className="sr-only">
            <caption>Money in and out per week</caption>
            <thead>
              <tr>
                <th scope="col">Week of</th>
                <th scope="col">Money in</th>
                <th scope="col">Money out</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.weekStart.toISOString()}>
                  <th scope="row">{formatShortDay(w.weekStart)}</th>
                  <td>
                    <MoneyAmount minorUnits={w.inMinor} />
                  </td>
                  <td>
                    <MoneyAmount minorUnits={w.outMinor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

function Total({
  label,
  swatch,
  minor,
}: {
  label: string;
  swatch: string;
  minor: number;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-ink-soft">
        <span aria-hidden="true" className={cn("h-2 w-2 rounded-sm", swatch)} />
        {label}
      </dt>
      <dd className="mt-0.5 text-base">
        <MoneyAmount minorUnits={minor} />
      </dd>
    </div>
  );
}

/** A thin bar anchored to the baseline; a non-zero week never vanishes. */
function Bar({
  minor,
  max,
  className,
}: {
  minor: number;
  max: number;
  className: string;
}) {
  const pct = minor === 0 ? 0 : Math.max(3, (minor / max) * 100);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "w-2.5 rounded-t-[4px] transition-[height] duration-500",
        className,
      )}
      style={{ height: `${pct}%` }}
    />
  );
}

function weekLabel(w: CashflowWeekView): string {
  return `Week of ${formatShortDay(w.weekStart)}: in ${formatMoney(w.inMinor)}, out ${formatMoney(w.outMinor)}`;
}
