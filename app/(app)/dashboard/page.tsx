import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDashboard } from "@/lib/services/dashboard-service";
import { BalanceCard } from "@/components/balance-card";
import { QuickActions } from "@/components/quick-actions";
import { AccountStrip } from "@/components/account-strip";
import { ActivityFeed } from "@/components/activity-feed";
import { AnnouncementCard } from "@/components/announcement-card";

export default async function DashboardPage() {
  const user = await requireUser();
  const view = await getDashboard(user.id, {
    name: user.name,
    accountNumber: user.accountNumber,
  });

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
      </section>

      <section className="rise rise-3 flex flex-col gap-2">
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
    </div>
  );
}
