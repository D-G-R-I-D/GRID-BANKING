/**
 * View models — the plain shapes the UI receives.
 * Services map domain/Prisma rows to these; components never see a Prisma row.
 */

export type AccountKindView = "FLOW" | "VAULT";

export interface AccountView {
  id: string;
  name: string;
  kind: AccountKindView;
  balanceMinor: number;
  currency: string;
}

export interface ActivityView {
  id: string;
  at: Date;
  note: string | null;
  amountMinor: number; // negative = money left this user
  currency: string;
  counterparty: string;
  direction: "in" | "out";
}

export interface DashboardView {
  firstName: string;
  accountNumber: string;
  totalMinor: number;
  currency: string;
  accounts: AccountView[];
  recentActivity: ActivityView[];
}

export interface TransferTargetsView {
  accounts: AccountView[];
}

export interface ProfileView {
  name: string;
  email: string;
  phone: string;
  accountNumberMasked: string;
}
