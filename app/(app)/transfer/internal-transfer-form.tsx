"use client";

import { useState } from "react";
import { ArrowDown } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { MoneyAmount } from "@/components/money-amount";
import { formatMoney, parseAmountToMinor } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { AccountView } from "@/lib/view";
import { internalTransferAction } from "./actions";
import { useTransferFlow } from "./use-transfer-flow";
import { ConfirmStep } from "./confirm-step";

export function InternalTransferForm({
  accounts,
  stepUpActive,
}: {
  accounts: AccountView[];
  stepUpActive: boolean;
}) {
  const {
    state,
    formAction,
    pending,
    confirming,
    setConfirming,
    idempotencyKey,
  } = useTransferFlow(internalTransferAction);

  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string>();

  const from = accounts.find((a) => a.id === fromId) ?? accounts[0];
  const to = accounts.find((a) => a.id !== fromId) ?? accounts[1];
  const amountMinor = parseAmountToMinor(amount);

  function toReview() {
    if (amountMinor === null || amountMinor <= 0) {
      setAmountError("Enter a valid amount, e.g. 25.00");
      return;
    }
    if (from && amountMinor > from.balanceMinor) {
      setAmountError("That's more than the account holds");
      return;
    }
    setAmountError(undefined);
    setConfirming(true);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="hidden"
        name="idempotencyKey"
        defaultValue={idempotencyKey}
      />
      <input type="hidden" name="fromAccountId" value={fromId} readOnly />
      <input type="hidden" name="toAccountId" value={to?.id ?? ""} readOnly />
      <input type="hidden" name="amount" value={amount} readOnly />
      <input type="hidden" name="note" value={note} readOnly />

      <div hidden={confirming} className="flex flex-col gap-4">
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
                  "rounded-md border p-3 text-left transition-colors active:scale-[0.98]",
                  a.id === fromId
                    ? "border-accent bg-accent-soft"
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

        <div className="flex items-center justify-center text-ink-faint">
          <ArrowDown size={16} />
        </div>

        <div className="rounded-md border border-line bg-surface p-3">
          <p className="text-sm text-ink">To {to?.name}</p>
          <p className="text-xs text-ink-faint">Your other account</p>
        </div>

        <Field
          label="Amount"
          inputMode="decimal"
          placeholder="0.00"
          prefix="₦"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={amountError}
        />
        <Field
          label="Note (optional)"
          maxLength={140}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Button type="button" size="lg" onClick={toReview}>
          Review transfer
        </Button>
      </div>

      {confirming && (
        <ConfirmStep
          rows={[
            { label: "From", value: from?.name ?? "—" },
            { label: "To", value: to?.name ?? "—" },
            {
              label: "Amount",
              value: (
                <MoneyAmount
                  minorUnits={amountMinor ?? 0}
                  currency={from?.currency}
                />
              ),
            },
            ...(note ? [{ label: "Note", value: note }] : []),
          ]}
          needsPassword={!stepUpActive}
          passwordError={state.fieldErrors?.password}
          error={state.error}
          pending={pending}
          buttonLabel={`Move ₦${amount}`}
          onBack={() => setConfirming(false)}
        />
      )}
    </form>
  );
}
