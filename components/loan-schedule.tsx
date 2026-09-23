import { MoneyAmount } from "@/components/money-amount";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { InstallmentStateView, InstallmentView } from "@/lib/view";

const STATE_LABEL: Record<InstallmentStateView, string> = {
  paid: "Paid",
  partial: "Part paid",
  overdue: "Overdue",
  due: "Next",
  upcoming: "Upcoming",
};

const STATE_TONE: Record<InstallmentStateView, string> = {
  paid: "text-positive",
  partial: "text-ink-soft",
  overdue: "text-critical",
  due: "text-accent",
  upcoming: "text-ink-faint",
};

export function LoanSchedule({
  installments,
}: {
  installments: InstallmentView[];
}) {
  return (
    <ol className="divide-y divide-line rounded-md border border-line bg-surface">
      {installments.map((i) => (
        <li
          key={i.sequence}
          className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
        >
          <div className="min-w-0">
            <p className="text-ink">{formatDay(i.dueDate)}</p>
            <p className={cn("text-xs", STATE_TONE[i.state])}>
              {STATE_LABEL[i.state]}
              {i.state === "partial" ||
              (i.state === "overdue" && i.paidMinor > 0) ? (
                <>
                  {" · "}
                  <MoneyAmount
                    minorUnits={i.paidMinor}
                    className="text-xs"
                  />{" "}
                  paid
                </>
              ) : null}
            </p>
          </div>
          <MoneyAmount
            minorUnits={i.amountMinor}
            className={cn(
              "text-sm",
              i.state === "paid" && "text-ink-faint line-through",
            )}
          />
        </li>
      ))}
    </ol>
  );
}
