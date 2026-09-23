import Link from "next/link";
import { requireUserWithPin } from "@/lib/session";
import { getLoans } from "@/lib/services/loan-service";
import { Coins } from "@/components/icons";
import { LoanSchedule } from "@/components/loan-schedule";
import { MoneyAmount } from "@/components/money-amount";
import { formatDay } from "@/lib/date";
import { LOAN_MAX_MINOR, LOAN_MIN_MINOR, MONTHLY_RATE_BPS } from "@/lib/loan";
import { formatMoney } from "@/lib/money";
import type { LoanView } from "@/lib/view";
import { RepayForm } from "./repay-form";

export default async function LoansPage() {
  const user = await requireUserWithPin();
  const { active, past, flowBalanceMinor } = await getLoans(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl">Loans</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Borrow when you need to. Repay monthly or all at once.
        </p>
      </div>

      {active ? (
        <>
          <ActiveLoanSummary loan={active} />

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-ink-soft">
              Make a payment
            </h2>
            <RepayForm
              key={active.repaidMinor}
              loan={active}
              flowBalanceMinor={flowBalanceMinor}
              pinLength={user.pinLength}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-ink-soft">
              {active.plan === "SINGLE" ? "Repayment" : "Schedule"}
            </h2>
            <LoanSchedule installments={active.installments} />
          </section>
        </>
      ) : (
        <NoLoan />
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink-soft">Past loans</h2>
          <ul className="divide-y divide-line rounded-md border border-line bg-surface">
            {past.map((loan) => (
              <li
                key={loan.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="tnum text-ink">{loan.reference}</p>
                  <p className="text-xs text-ink-faint">
                    Repaid{loan.closedAt ? ` ${formatDay(loan.closedAt)}` : ""}
                  </p>
                </div>
                <MoneyAmount
                  minorUnits={loan.principalMinor}
                  className="text-sm"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ActiveLoanSummary({ loan }: { loan: LoanView }) {
  const pct = Math.round((loan.repaidMinor / loan.totalMinor) * 100);
  const next = loan.nextDue;

  return (
    <div className="rounded-lg bg-card p-5 text-card-ink">
      <p className="text-xs text-card-ink-soft">Left to repay</p>
      <p className="mt-1 text-3xl">
        <MoneyAmount minorUnits={loan.outstandingMinor} inherit />
      </p>

      <div
        role="progressbar"
        aria-label="Repaid so far"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-card-line"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-card-ink-soft">
        {formatMoney(loan.repaidMinor)} of {formatMoney(loan.totalMinor)} repaid
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-card-line pt-4 text-sm">
        <div>
          <dt className="text-xs text-card-ink-soft">
            {next?.overdue ? "Overdue" : "Next payment"}
          </dt>
          <dd
            className={
              next?.overdue ? "mt-0.5 text-critical" : "mt-0.5 text-card-ink"
            }
          >
            {next ? (
              <>
                <MoneyAmount minorUnits={next.amountMinor} inherit />
                <span className="block text-xs text-card-ink-soft">
                  {formatDay(next.dueDate)}
                </span>
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-card-ink-soft">Borrowed</dt>
          <dd className="mt-0.5 text-card-ink">
            <MoneyAmount minorUnits={loan.principalMinor} inherit />
            <span className="block text-xs text-card-ink-soft">
              {formatDay(loan.createdAt)} · {loan.termMonths} mo
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function NoLoan() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-6 py-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">
        <Coins size={22} />
      </span>
      <div>
        <p className="text-sm font-medium text-ink">No active loan</p>
        <p className="mt-1 text-sm text-ink-soft">
          Borrow {formatMoney(LOAN_MIN_MINOR)} to {formatMoney(LOAN_MAX_MINOR)}{" "}
          at {MONTHLY_RATE_BPS / 100}% a month, flat. Paid into Flow instantly.
        </p>
      </div>
      <Link
        href="/loans/apply"
        className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
      >
        Get a loan
      </Link>
    </div>
  );
}
