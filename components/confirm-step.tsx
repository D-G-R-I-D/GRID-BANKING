"use client";

import type { ReactNode } from "react";
import { Lock } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/ui/pin-input";

export interface ConfirmRow {
  label: string;
  value: ReactNode;
}

/**
 * The review screen before any money moves: what's about to happen, then
 * the transaction PIN. Shared by transfers and loans.
 */
export function ConfirmStep({
  title,
  rows,
  pinLength,
  pinError,
  pinKey,
  error,
  pending,
  buttonLabel,
  pendingLabel = "Sending…",
  footnote = "Encrypted · instant · no fee",
  onBack,
}: {
  title: string;
  rows: ConfirmRow[];
  pinLength: number;
  pinError?: string;
  /** Change it to clear the PIN boxes (e.g. after each failed submit). */
  pinKey?: number;
  error?: string;
  pending: boolean;
  buttonLabel: string;
  pendingLabel?: string;
  footnote?: string;
  onBack: () => void;
}) {
  return (
    <div className="pop flex flex-col gap-4">
      <p className="text-sm font-medium text-ink">{title}</p>

      <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
          >
            <dt className="text-ink-soft">{r.label}</dt>
            <dd className="text-right font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>

      <PinInput
        key={pinKey}
        length={pinLength}
        name="pin"
        label="Transaction PIN"
        hint="Enter your PIN to authorise this."
        error={pinError}
        autoFocus
      />

      {error && (
        <p role="alert" className="text-sm text-critical">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="flex-1"
        >
          Edit
        </Button>
        <Button type="submit" pending={pending} className="flex-1">
          {pending ? pendingLabel : buttonLabel}
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-faint">
        <Lock size={12} /> {footnote}
      </p>
    </div>
  );
}
