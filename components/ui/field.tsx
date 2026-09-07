"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface FieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  hint?: ReactNode;
  error?: string;
  prefix?: string;
}

export function Field({
  label,
  hint,
  error,
  prefix,
  className,
  ...props
}: FieldProps) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center rounded-md border bg-surface transition-colors",
          error ? "border-critical" : "border-line focus-within:border-accent",
        )}
      >
        {prefix && (
          <span className="pl-3 text-sm text-ink-faint tnum">{prefix}</span>
        )}
        <input
          id={id}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-faint",
            className,
          )}
          {...props}
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
