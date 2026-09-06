"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

interface FieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  hint?: ReactNode;
  error?: string;
}

export function Field({
  label,
  hint,
  error,
  className = "",
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
      <input
        id={id}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        className={`h-10 rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus-visible:border-accent ${className}`}
        {...props}
      />
      {hint && (
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
