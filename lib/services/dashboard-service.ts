import "server-only";
import { firstName } from "@/lib/name";
import { listAccountsByUser } from "@/lib/data/accounts";
import { listTransfersForAccounts } from "@/lib/data/transfers";
import { getCashflow } from "@/lib/services/insights-service";
import { getLoanSnapshot } from "@/lib/services/loan-service";
import { toAccountView, toActivityView } from "@/lib/services/mappers";
import type { DashboardView } from "@/lib/view";

interface DashboardUser {
  name: string;
  accountNumber: string;
}

export async function getDashboard(
  userId: string,
  user: DashboardUser,
): Promise<DashboardView> {
  const [accounts, loan] = await Promise.all([
    listAccountsByUser(userId),
    getLoanSnapshot(userId),
  ]);
  const owned = new Set(accounts.map((a) => a.id));
  const [transfers, cashflow] = await Promise.all([
    listTransfersForAccounts([...owned], 6),
    getCashflow([...owned]),
  ]);

  const accountViews = accounts.map(toAccountView);
  return {
    firstName: firstName(user.name),
    accountNumber: user.accountNumber,
    currency: accountViews[0]?.currency ?? "NGN",
    totalMinor: accountViews.reduce((sum, a) => sum + a.balanceMinor, 0),
    accounts: accountViews,
    recentActivity: transfers.map((t) => toActivityView(t, owned)),
    loan,
    cashflow,
  };
}
