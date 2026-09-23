import { Wallet, Lock } from "@/components/icons";
import { MoneyAmount } from "@/components/money-amount";
import type { AccountView } from "@/lib/view";

export function AccountStrip({ accounts }: { accounts: AccountView[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {accounts.map((a) => {
        const Icon = a.kind === "VAULT" ? Lock : Wallet;
        return (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-md border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-sunk text-ink-soft">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm text-ink">{a.name}</p>
                <p className="text-xs text-ink-faint">
                  {a.kind === "VAULT" ? "Money you keep" : "Money you spend"}
                </p>
              </div>
            </div>
            <MoneyAmount
              minorUnits={a.balanceMinor}
              currency={a.currency}
              className="text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}
