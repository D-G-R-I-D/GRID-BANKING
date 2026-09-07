"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowDown } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { AccountView } from "@/lib/view";
import { transferAction, type TransferState } from "./actions";

const initial: TransferState = {};

export function TransferForm({ accounts }: { accounts: AccountView[] }) {
  const [state, action, pending] = useActionState(transferAction, initial);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const from = accounts.find((a) => a.id === fromId) ?? accounts[0];
  const to = accounts.find((a) => a.id !== fromId) ?? accounts[1];

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="idempotencyKey" defaultValue={idempotencyKey} />
      <input type="hidden" name="toAccountId" value={to?.id ?? ""} readOnly />
      <input type="hidden" name="fromAccountId" value={fromId} readOnly />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">From</p>
        <div className="grid grid-cols-2 gap-2">
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setFromId(a.id)}
              aria-pressed={a.id === fromId}
              className={cn(
                "rounded-md border p-3 text-left transition-colors",
                a.id === fromId
                  ? "border-accent bg-surface-sunk"
                  : "border-line bg-surface hover:bg-surface-sunk",
              )}
            >
              <span className="block text-sm text-ink">{a.name}</span>
              <span className="tnum block text-xs text-ink-faint">
                {formatMoney(a.balanceMinor, a.currency)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center py-1 text-ink-faint">
        <ArrowDown size={16} />
      </div>

      <div className="rounded-md border border-line bg-surface p-3">
        <p className="text-sm text-ink">To {to?.name}</p>
        <p className="text-xs text-ink-faint">Your other account</p>
      </div>

      <Field
        label="Amount"
        name="amount"
        inputMode="decimal"
        placeholder="0.00"
        prefix="₦"
        required
        error={state.fieldErrors?.amount}
      />
      <Field
        label="Note (optional)"
        name="note"
        maxLength={140}
        error={state.fieldErrors?.note}
      />

      {state.error && (
        <p role="alert" className="text-sm text-critical">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-positive">
          {state.success}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : `Send from ${from?.name ?? "account"}`}
      </Button>
    </form>
  );
}
