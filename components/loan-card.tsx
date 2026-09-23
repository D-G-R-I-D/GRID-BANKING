import Link from "next/link";
import { Coins } from "@/components/icons";
import { MoneyAmount } from "@/components/money-amount";
import { formatShortDay } from "@/lib/date";
import type { LoanSnapshotView } from "@/lib/view";

/** Dashboard nudge for an active loan: what's left and what's due next. */
export function LoanCard({ loan }: { loan: LoanSnapshotView }) {
  const next = loan.nextDue;
  return (
    <Link
      href="/loans"
      className="flex items-center gap-3 rounded-md border border-line bg-surface p-4 transition-colors hover:bg-surface-sunk"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-sunk text-ink-soft">
        <Coins size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">Loan</p>
        {next && (
          <p
            className={
              next.overdue ? "text-xs text-critical" : "text-xs text-ink-faint"
            }
          >
            <MoneyAmount minorUnits={next.amountMinor} inherit />{" "}
            {next.overdue ? "overdue since" : "due"}{" "}
            {formatShortDay(next.dueDate)}
          </p>
        )}
      </div>
      <div className="text-right">
        <MoneyAmount minorUnits={loan.outstandingMinor} className="text-sm" />
        <p className="text-xs text-ink-faint">left</p>
      </div>
    </Link>
  );
}
