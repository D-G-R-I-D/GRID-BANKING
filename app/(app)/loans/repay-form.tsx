"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChoiceGroup, type Choice } from "@/components/ui/choice-group";
import { Field } from "@/components/ui/field";
import { ConfirmStep } from "@/components/confirm-step";
import { MoneyAmount } from "@/components/money-amount";
import { useToast } from "@/components/toast";
import { usePinAction } from "@/components/use-pin-action";
import { formatShortDay } from "@/lib/date";
import { repaymentAmountError } from "@/lib/loan";
import { formatMoney, parseAmountToMinor } from "@/lib/money";
import type { LoanView } from "@/lib/view";
import { repayLoanAction, type LoanState } from "./actions";

type Mode = "next" | "overdue" | "full" | "custom";
const initial: LoanState = {};

/** Minor units -> the plain "1234.56" string the amount field posts. */
const toAmountString = (minor: number) => (minor / 100).toFixed(2);

/**
 * Pay the next installment, clear what's overdue, pay off everything, or
 * choose an amount. Remounted (keyed) by the page after each payment so it
 * starts fresh with a new idempotency key.
 */
export function RepayForm({
  loan,
  flowBalanceMinor,
  pinLength,
}: {
  loan: LoanView;
  flowBalanceMinor: number;
  pinLength: number;
}) {
  const { toast } = useToast();
  const {
    state,
    pinKey,
    formAction,
    pending,
    confirming,
    setConfirming,
    idempotencyKey,
  } = usePinAction(repayLoanAction, initial, (result) => {
    if (result.loanId) {
      toast(paysOff ? "Loan paid off — well done" : "Payment received");
    }
  });

  const outstanding = loan.outstandingMinor;
  const next = loan.nextDue;
  const showOverdue = loan.overdueMinor > 0 && loan.overdueMinor < outstanding;
  const showNext =
    next !== null &&
    next.amountMinor < outstanding &&
    !(showOverdue && next.overdue);

  const options: Choice<Mode>[] = [
    ...(showOverdue
      ? [
          {
            value: "overdue" as const,
            label: <MoneyAmount minorUnits={loan.overdueMinor} />,
            description: "Everything overdue",
          },
        ]
      : []),
    ...(showNext && next
      ? [
          {
            value: "next" as const,
            label: <MoneyAmount minorUnits={next.amountMinor} />,
            description: `Next payment · due ${formatShortDay(next.dueDate)}`,
          },
        ]
      : []),
    {
      value: "full",
      label: <MoneyAmount minorUnits={outstanding} />,
      description: "Pay off the whole loan",
    },
    { value: "custom", label: "Other amount", description: "Any amount" },
  ];

  const [mode, setMode] = useState<Mode>(options[0]!.value);
  const [custom, setCustom] = useState("");
  const [amountError, setAmountError] = useState<string>();

  const amountMinor =
    mode === "custom"
      ? parseAmountToMinor(custom)
      : mode === "full"
        ? outstanding
        : mode === "overdue"
          ? loan.overdueMinor
          : (next?.amountMinor ?? 0);
  const paysOff = amountMinor === outstanding;

  function toReview() {
    const err = repaymentAmountError(amountMinor, outstanding);
    if (err) {
      setAmountError(err);
      return;
    }
    if (amountMinor !== null && amountMinor > flowBalanceMinor) {
      setAmountError("That's more than your Flow account holds");
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
      <input type="hidden" name="loanId" value={loan.id} readOnly />
      <input
        type="hidden"
        name="amount"
        value={amountMinor === null ? "" : toAmountString(amountMinor)}
        readOnly
      />

      <div hidden={confirming} className="flex flex-col gap-4">
        <ChoiceGroup
          legend="How much?"
          value={mode}
          options={options}
          onChange={(m) => {
            setMode(m);
            setAmountError(undefined);
          }}
        />

        {mode === "custom" && (
          <Field
            label="Amount"
            inputMode="decimal"
            placeholder="0.00"
            prefix="₦"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            error={amountError}
          />
        )}
        {mode !== "custom" && amountError && (
          <p role="alert" className="text-sm text-critical">
            {amountError}
          </p>
        )}

        <p className="text-xs text-ink-faint">
          From Flow · balance{" "}
          <MoneyAmount minorUnits={flowBalanceMinor} className="text-xs" />
        </p>

        <Button type="button" size="lg" onClick={toReview}>
          Review payment
        </Button>
      </div>

      {confirming && amountMinor !== null && (
        <ConfirmStep
          title="Confirm your payment"
          rows={[
            {
              label: "Loan",
              value: <span className="tnum">{loan.reference}</span>,
            },
            { label: "From", value: "Flow" },
            {
              label: "Amount",
              value: <MoneyAmount minorUnits={amountMinor} />,
            },
            {
              label: "Left to repay after",
              value: <MoneyAmount minorUnits={outstanding - amountMinor} />,
            },
          ]}
          pinLength={pinLength}
          pinError={state.fieldErrors?.pin}
          pinKey={pinKey}
          error={state.error}
          pending={pending}
          buttonLabel={
            paysOff ? "Pay off loan" : `Pay ${formatMoney(amountMinor)}`
          }
          pendingLabel="Paying…"
          footnote="Instant · no fees for paying early"
          onBack={() => setConfirming(false)}
        />
      )}
    </form>
  );
}
