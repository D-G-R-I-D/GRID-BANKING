import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getAccountsForUser, getRecentActivity } from "@/lib/accounts";
import { Card } from "@/components/ui/card";
import { MoneyAmount } from "@/components/money-amount";
import { maskAccount } from "@/lib/money";

export default async function DashboardPage() {
  const user = await requireUser();
  const [accounts, activity] = await Promise.all([
    getAccountsForUser(user.id),
    getRecentActivity(user.id),
  ]);

  const currency = accounts[0]?.currency ?? "USD";
  const totalMinor = accounts.reduce((sum, a) => sum + a.balanceMinor, 0);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="text-sm text-ink-soft">Total position</p>
        <p className="mt-1 text-4xl">
          <MoneyAmount minorUnits={totalMinor} currency={currency} />
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink-soft">Accounts</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <p className="text-sm text-ink">{account.name}</p>
              <p className="tnum mt-1 text-xs text-ink-faint">
                {maskAccount(account.id)}
              </p>
              <p className="mt-4 text-xl">
                <MoneyAmount
                  minorUnits={account.balanceMinor}
                  currency={account.currency}
                />
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-soft">Recent activity</h2>
          <Link href="/transfer" className="text-sm text-accent underline">
            Move money
          </Link>
        </div>

        {activity.length === 0 ? (
          <Card className="text-sm text-ink-soft">
            Nothing yet. Your transfers will show up here.
          </Card>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {activity.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm text-ink">{item.counterparty}</p>
                  <p className="text-xs text-ink-faint">
                    {item.note ?? "Transfer"} ·{" "}
                    {item.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <MoneyAmount
                  minorUnits={item.amountMinor}
                  currency={item.currency}
                  signed
                  className="text-sm"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
