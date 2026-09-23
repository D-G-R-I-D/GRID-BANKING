"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A PIN entry: one real (masked, numeric) input laid over a row of boxes.
 * Keeping a single input means keyboard, paste, screen readers and form
 * submission all behave like any other field — the boxes are decoration.
 *
 * Controlled if `value` is passed, otherwise it keeps its own state (remount
 * it with a new `key` to clear it, e.g. after a wrong PIN).
 */
export function PinInput({
  length,
  name,
  label,
  hint,
  error,
  value: controlled,
  onChange,
  autoFocus,
}: {
  length: number;
  name?: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [own, setOwn] = useState("");
  const [focused, setFocused] = useState(false);
  const value = controlled ?? own;

  function update(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, length);
    if (controlled === undefined) setOwn(digits);
    onChange?.(digits);
  }

  const describedBy =
    [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative flex gap-2">
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length;
          const active =
            focused && (i === value.length || (i === length - 1 && filled));
          return (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "grid h-12 flex-1 place-items-center rounded-md border bg-surface transition-colors",
                error
                  ? "border-critical"
                  : active
                    ? "border-accent"
                    : "border-line",
              )}
            >
              {filled && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
            </span>
          );
        })}
        <input
          id={id}
          name={name}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          maxLength={length}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => update(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="absolute inset-0 h-full w-full cursor-text text-transparent caret-transparent opacity-0"
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-critical">
          {error}
        </p>
      )}
    </div>
  );
}
