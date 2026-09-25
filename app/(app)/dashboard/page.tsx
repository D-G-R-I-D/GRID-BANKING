import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDashboard } from "@/lib/services/dashboard-service";
import { BalanceCard } from "@/components/balance-card";
import { QuickActions } from "@/components/quick-actions";
import { AccountStrip } from "@/components/account-strip";
import { LoanCard } from "@/components/loan-card";
import { CashflowCard } from "@/components/cashflow-card";
import { ActivityFeed } from "@/components/activity-feed";
import { AnnouncementCard } from "@/components/announcement-card";
import { IdentityPrompt } from "@/components/identity-prompt";
import { getIdentity } from "@/lib/services/identity-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const [view, identity] = await Promise.all([
    getDashboard(user.id, {
      name: user.name,
      accountNumber: user.accountNumber,
    }),
    getIdentity(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rise">
        <BalanceCard
          balanceMinor={view.totalMinor}
          currency={view.currency}
          accountNumber={view.accountNumber}
          firstName={view.firstName}
        />
      </div>

      <div className="rise rise-1">
        <QuickActions />
      </div>

      <AnnouncementCard />

      <section className="rise rise-2 flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink-soft">Accounts</h2>
        <AccountStrip accounts={view.accounts} />
        {view.loan && <LoanCard loan={view.loan} />}
      </section>

      <div className="rise rise-3">
        <CashflowCard cashflow={view.cashflow} />
      </div>

      <section className="rise rise-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-soft">Recent activity</h2>
          <Link
            href="/activity"
            className="text-xs text-accent hover:underline"
          >
            See all
          </Link>
        </div>
        <ActivityFeed items={view.recentActivity} />
      </section>

      <IdentityPrompt due={identity.promptDue} />
    </div>
  );
}
