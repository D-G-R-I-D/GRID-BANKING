"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { Field } from "@/components/ui/field";
import { ConfirmStep } from "@/components/confirm-step";
import { MoneyAmount } from "@/components/money-amount";
import { useToast } from "@/components/toast";
import { usePinAction } from "@/components/use-pin-action";
import { formatDay } from "@/lib/date";
import {
  LOAN_TERMS,
  MONTHLY_RATE_BPS,
  loanAmountError,
  quoteLoan,
  type LoanPlanKind,
  type LoanTerm,
} from "@/lib/loan";
import { formatMoney, parseAmountToMinor } from "@/lib/money";
import { applyForLoanAction, type LoanState } from "../actions";

const initial: LoanState = {};
const ratePct = `${MONTHLY_RATE_BPS / 100}%`;

export function LoanApplicationForm({ pinLength }: { pinLength: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    state,
    pinKey,
    formAction,
    pending,
    confirming,
    setConfirming,
    idempotencyKey,
  } = usePinAction(applyForLoanAction, initial);

  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState<LoanTerm>(3);
  const [plan, setPlan] = useState<LoanPlanKind>("INSTALLMENTS");
  const [amountError, setAmountError] = useState<string>();

  const principalMinor = parseAmountToMinor(amount);
  const quote =
    loanAmountError(principalMinor) === null && principalMinor !== null
      ? quoteLoan(principalMinor, term, plan)
      : null;
  const monthly = plan === "INSTALLMENTS" && term > 1;
  const first = quote?.schedule[0];

  useEffect(() => {
    if (state.loanId) {
      toast("Loan approved — the money is in your Flow account");
      router.push("/loans");
    }
  }, [state.loanId, router, toast]);

  function toReview() {
    const err = loanAmountError(principalMinor);
    if (err) {
      setAmountError(err);
      return;
    }
    setAmountError(undefined);
    setConfirming(true);
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input
        type="hidden"
        name="idempotencyKey"
        defaultValue={idempotencyKey}
      />
      <input type="hidden" name="amount" value={amount} readOnly />
      <input type="hidden" name="termMonths" value={term} readOnly />
      <input type="hidden" name="plan" value={plan} readOnly />

      <div hidden={confirming} className="flex flex-col gap-5">
        <Field
          label="How much do you need?"
          inputMode="decimal"
          placeholder="0.00"
          prefix="₦"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint="From ₦5,000 to ₦500,000."
          error={amountError}
        />

        <ChoiceGroup
          legend="Pay it back over"
          value={String(term)}
          columns={4}
          options={LOAN_TERMS.map((t) => ({
            value: String(t),
            label: `${t} mo`,
          }))}
          onChange={(v) => setTerm(Number(v) as LoanTerm)}
        />

        <ChoiceGroup
          legend="How you'll repay"
          value={plan}
          options={[
            {
              value: "INSTALLMENTS",
              label: "Monthly",
              description: "Equal payments each month",
            },
            {
              value: "SINGLE",
              label: "All at once",
              description: "One payment at the end",
            },
          ]}
          onChange={setPlan}
        />

        <div
          aria-live="polite"
          className="rounded-lg border border-line bg-surface"
        >
          {quote && first ? (
            <dl className="divide-y divide-line text-sm">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-soft">
                  Interest ({ratePct} a month, flat)
                </dt>
                <dd>
                  <MoneyAmount minorUnits={quote.interestMinor} />
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-soft">Total to repay</dt>
                <dd className="font-medium">
                  <MoneyAmount minorUnits={quote.totalMinor} />
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-soft">
                  {monthly ? `${term} monthly payments of` : "One payment of"}
                </dt>
                <dd>
                  <MoneyAmount minorUnits={first.amountMinor} />
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-soft">
                  {monthly ? "First payment due" : "Due"}
                </dt>
                <dd className="text-ink">{formatDay(first.dueDate)}</dd>
              </div>
            </dl>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">
              Enter an amount to see what you&rsquo;ll pay.
            </p>
          )}
        </div>

        <p className="text-xs text-ink-faint">
          Pay early whenever you like — in part or in full. No fees and no
          penalty for paying early.
        </p>

        <Button type="button" size="lg" onClick={toReview}>
          Review loan
        </Button>
      </div>

      {confirming && quote && first && (
        <ConfirmStep
          title="Confirm your loan"
          rows={[
            {
              label: "You get",
              value: <MoneyAmount minorUnits={quote.principalMinor} />,
            },
            { label: "Paid into", value: "Flow" },
            {
              label: "Interest",
              value: <MoneyAmount minorUnits={quote.interestMinor} />,
            },
            {
              label: "Total to repay",
              value: <MoneyAmount minorUnits={quote.totalMinor} />,
            },
            {
              label: "Repayment",
              value: monthly
                ? `${term} × ${formatMoney(first.amountMinor)}`
                : `Once, on ${formatDay(first.dueDate)}`,
            },
            ...(monthly
              ? [{ label: "First due", value: formatDay(first.dueDate) }]
              : []),
          ]}
          pinLength={pinLength}
          pinError={state.fieldErrors?.pin}
          pinKey={pinKey}
          error={state.error}
          pending={pending}
          buttonLabel={`Get ${formatMoney(quote.principalMinor)}`}
          pendingLabel="Approving…"
          footnote="Paid into Flow instantly · no fees"
          onBack={() => setConfirming(false)}
        />
      )}
    </form>
  );
}
