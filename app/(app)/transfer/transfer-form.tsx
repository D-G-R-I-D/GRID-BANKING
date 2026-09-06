"use client";

import { useActionState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { formatMoney } from "@/lib/money";
import { transferAction, type TransferState } from "./actions";

interface AccountOption {
  id: string;
  name: string;
  balanceMinor: number;
  currency: string;
}

const initial: TransferState = {};

export function TransferForm({ accounts }: { accounts: AccountOption[] }) {
  const [state, action, pending] = useActionState(transferAction, initial);

  // A fresh key per mount so a resubmit after success is a new transfer,
  // but a double-click within one submit is de-duplicated server-side.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="idempotencyKey" defaultValue={idempotencyKey} />

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        From
        <select
          name="fromAccountId"
          required
          className="h-10 rounded-md border border-line bg-surface px-3 text-sm"
          defaultValue={accounts[0]?.id}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {formatMoney(a.balanceMinor, a.currency)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        To
        <select
          name="toAccountId"
          required
          className="h-10 rounded-md border border-line bg-surface px-3 text-sm"
          defaultValue={accounts[1]?.id}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <Field
        label="Amount"
        name="amount"
        inputMode="decimal"
        placeholder="0.00"
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

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Sending…" : "Send transfer"}
      </Button>
    </form>
  );
}
