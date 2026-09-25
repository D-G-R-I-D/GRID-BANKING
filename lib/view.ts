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
  /** What sort of movement, for the icon: a person, your Vault, a loan, a bill. */
  kind: ActivityKind;
}

export type ActivityKind = "transfer" | "internal" | "loan" | "bills";

export interface CashflowWeekView {
  weekStart: Date;
  inMinor: number;
  outMinor: number;
}

export interface CashflowView {
  weeks: CashflowWeekView[];
  inMinor: number;
  outMinor: number;
}

export interface DashboardView {
  firstName: string;
  accountNumber: string;
  totalMinor: number;
  currency: string;
  accounts: AccountView[];
  recentActivity: ActivityView[];
  loan: LoanSnapshotView | null;
  cashflow: CashflowView;
}

export interface TransferTargetsView {
  accounts: AccountView[];
}

export interface RecipientView {
  name: string;
  accountNumber: string;
}

export interface ReceiptView {
  reference: string;
  at: Date;
  amountMinor: number;
  currency: string;
  fromLabel: string;
  toLabel: string;
  toAccountNumber: string | null;
  note: string | null;
  kind: "internal" | "external";
}

export interface ProfileView {
  name: string;
  email: string;
  phone: string;
  accountNumberMasked: string;
}

export type InstallmentStateView =
  "paid" | "partial" | "overdue" | "due" | "upcoming";

export interface InstallmentView {
  sequence: number;
  dueDate: Date;
  amountMinor: number;
  paidMinor: number;
  state: InstallmentStateView;
}

export interface NextDueView {
  dueDate: Date;
  amountMinor: number; // what's still owed on that installment
  overdue: boolean;
}

export interface LoanView {
  id: string;
  reference: string;
  principalMinor: number;
  interestMinor: number;
  totalMinor: number;
  repaidMinor: number;
  outstandingMinor: number;
  overdueMinor: number;
  monthlyRateBps: number;
  termMonths: number;
  plan: "INSTALLMENTS" | "SINGLE";
  status: "ACTIVE" | "REPAID";
  createdAt: Date;
  closedAt: Date | null;
  nextDue: NextDueView | null;
  installments: InstallmentView[];
}

export interface LoansView {
  active: LoanView | null;
  past: LoanView[];
  flowBalanceMinor: number;
  currency: string;
}

export interface LoanSnapshotView {
  outstandingMinor: number;
  nextDue: NextDueView | null;
}

/** The most recent money someone else sent this user (for the live toast). */
export interface IncomingView {
  id: string;
  amountMinor: number;
  from: string;
}

export interface IdentityView {
  bvnLast4: string | null;
  ninLast4: string | null;
  complete: boolean;
  loanLimitMinor: number;
  /** Show the dashboard nudge: not complete and not snoozed. */
  promptDue: boolean;
}
