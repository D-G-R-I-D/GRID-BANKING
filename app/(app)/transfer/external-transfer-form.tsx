"use client";

import { useState, useTransition } from "react";
import { Check, Users } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { MoneyAmount } from "@/components/money-amount";
import { parseAmountToMinor } from "@/lib/money";
import type { RecipientView } from "@/lib/view";
import { externalTransferAction, lookupRecipientAction } from "./actions";
import { useTransferFlow } from "./use-transfer-flow";
import { ConfirmStep } from "./confirm-step";

export function ExternalTransferForm({
  stepUpActive,
}: {
  stepUpActive: boolean;
}) {
  const {
    state,
    formAction,
    pending,
    confirming,
    setConfirming,
    idempotencyKey,
  } = useTransferFlow(externalTransferAction);

  const [acct, setAcct] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string>();
  const [recipient, setRecipient] = useState<RecipientView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [looking, startLookup] = useTransition();

  const amountMinor = parseAmountToMinor(amount);

  function onAcctChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setAcct(digits);
    setRecipient(null);
    setNotFound(false);
    if (digits.length === 10) {
      startLookup(async () => {
        const found = await lookupRecipientAction(digits);
        if (found) setRecipient(found);
        else setNotFound(true);
      });
    }
  }

  function toReview() {
    if (!recipient) return;
    if (amountMinor === null || amountMinor <= 0) {
      setAmountError("Enter a valid amount, e.g. 25.00");
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
      <input
        type="hidden"
        name="recipientAccountNumber"
        value={acct}
        readOnly
      />
      <input type="hidden" name="amount" value={amount} readOnly />
      <input type="hidden" name="note" value={note} readOnly />

      <div hidden={confirming} className="flex flex-col gap-4">
        <Field
          label="Recipient account number"
          inputMode="numeric"
          placeholder="10 digits"
          value={acct}
          onChange={(e) => onAcctChange(e.target.value)}
          error={notFound ? "No GRID account with that number" : undefined}
          hint={looking ? "Checking…" : undefined}
        />

        {recipient && (
          <div className="pop flex items-center gap-3 rounded-md border border-line bg-accent-soft p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink">
              <Users size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {recipient.name}
              </p>
              <p className="tnum text-xs text-ink-faint">
                {recipient.accountNumber}
              </p>
            </div>
            <Check size={16} className="ml-auto text-positive" />
          </div>
        )}

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

        <Button
          type="button"
          size="lg"
          onClick={toReview}
          disabled={!recipient || looking}
        >
          {looking && <Spinner size={14} />}
          {recipient ? "Review transfer" : "Enter an account number"}
        </Button>
      </div>

      {confirming && recipient && (
        <ConfirmStep
          rows={[
            { label: "To", value: recipient.name },
            {
              label: "Account",
              value: <span className="tnum">{recipient.accountNumber}</span>,
            },
            {
              label: "Amount",
              value: <MoneyAmount minorUnits={amountMinor ?? 0} />,
            },
            ...(note ? [{ label: "Note", value: note }] : []),
          ]}
          needsPassword={!stepUpActive}
          passwordError={state.fieldErrors?.password}
          error={state.error}
          pending={pending}
          buttonLabel={`Send ₦${amount}`}
          onBack={() => setConfirming(false)}
        />
      )}
    </form>
  );
}
