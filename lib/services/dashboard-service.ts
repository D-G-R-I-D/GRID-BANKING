import "server-only";
import { firstName } from "@/lib/name";
import { listAccountsByUser } from "@/lib/data/accounts";
import { listTransfersForAccounts } from "@/lib/data/transfers";
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
  const accounts = await listAccountsByUser(userId);
  const ids = accounts.map((a) => a.id);
  const owned = new Set(ids);
  const nameById = new Map(accounts.map((a) => [a.id, a.name]));

  const transfers = await listTransfersForAccounts(ids, 6);

  const accountViews = accounts.map(toAccountView);
  return {
    firstName: firstName(user.name),
    accountNumber: user.accountNumber,
    currency: accountViews[0]?.currency ?? "NGN",
    totalMinor: accountViews.reduce((sum, a) => sum + a.balanceMinor, 0),
    accounts: accountViews,
    recentActivity: transfers.map((t) => toActivityView(t, owned, nameById)),
  };
}
