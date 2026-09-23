"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Choice<T extends string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
}

/**
 * A set of native radio buttons dressed as cards. Real radios keep arrow-key
 * navigation, form posting and screen-reader semantics for free.
 */
export function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  columns = 2,
}: {
  legend: string;
  name?: string;
  value: T;
  options: Choice<T>[];
  onChange: (value: T) => void;
  columns?: 1 | 2 | 4;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-ink">{legend}</legend>
      <div
        className={cn(
          "grid gap-2",
          columns === 4 && "grid-cols-4",
          columns === 2 && "grid-cols-2",
        )}
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                "cursor-pointer rounded-md border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                selected
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:bg-surface-sunk",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className="block text-sm text-ink">{o.label}</span>
              {o.description && (
                <span className="mt-0.5 block text-xs text-ink-faint">
                  {o.description}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
