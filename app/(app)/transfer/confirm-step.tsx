"use client";

import type { ReactNode } from "react";
import { Lock } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export interface ConfirmRow {
  label: string;
  value: ReactNode;
}

export function ConfirmStep({
  rows,
  needsPassword,
  passwordError,
  error,
  pending,
  buttonLabel,
  onBack,
}: {
  rows: ConfirmRow[];
  needsPassword: boolean;
  passwordError?: string;
  error?: string;
  pending: boolean;
  buttonLabel: string;
  onBack: () => void;
}) {
  return (
    <div className="pop flex flex-col gap-4">
      <p className="text-sm font-medium text-ink">Confirm this transfer</p>

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

      {needsPassword && (
        <Field
          label="Your password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          hint="Confirm it's you before we send."
          error={passwordError}
        />
      )}

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
          {pending ? "Sending…" : buttonLabel}
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-faint">
        <Lock size={12} /> Encrypted · instant · no fee
      </p>
    </div>
  );
}
