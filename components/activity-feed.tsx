import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Lock,
  Phone,
} from "@/components/icons";
import { MoneyAmount } from "@/components/money-amount";
import type { ActivityView } from "@/lib/view";
import { dayGroupLabel, formatTime } from "@/lib/date";

type IconType = ComponentType<{ size?: number }>;

/** A glyph per kind of movement, so the list scans at a glance. */
function iconFor(item: ActivityView): IconType {
  switch (item.kind) {
    case "loan":
      return Coins;
    case "bills":
      return Phone;
    case "internal":
      return Lock;
    default:
      return item.direction === "in" ? ArrowDownLeft : ArrowUpRight;
  }
}

export function ActivityFeed({ items }: { items: ActivityView[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-line bg-surface p-6 text-center text-sm text-ink-soft">
        No activity yet. Your transfers will show up here.
      </div>
    );
  }

  const groups = new Map<string, ActivityView[]>();
  for (const item of items) {
    const key = dayGroupLabel(item.at);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([label, group]) => (
        <div key={label}>
          <p className="mb-1.5 text-xs font-medium text-ink-faint">{label}</p>
          <ul className="overflow-hidden rounded-md border border-line bg-surface">
            {group.map((item) => {
              const incoming = item.direction === "in";
              const Icon = iconFor(item);
              return (
                <li
                  key={item.id}
                  className="border-b border-line last:border-b-0"
                >
                  <Link
                    href={`/transfer/receipt/${item.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-sunk"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-sunk text-ink-soft">
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">
                        {item.counterparty}
                      </p>
                      <p className="truncate text-xs text-ink-faint">
                        {item.note ?? (incoming ? "Received" : "Sent")} ·{" "}
                        {formatTime(item.at)}
                      </p>
                    </div>
                    <MoneyAmount
                      minorUnits={item.amountMinor}
                      currency={item.currency}
                      signed
                      className="text-sm"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
