/**
 * Airtime & data top-up rules — pure and client-safe. The client uses them
 * for instant feedback; the server re-runs them and prices the purchase
 * itself (never from the URL or the form).
 */
import { DATA_PLANS, NETWORKS, type DataPlan } from "./topup-data";
import { groupThousands } from "./money";

export type TopUpKind = "airtime" | "data";
export type Network = (typeof NETWORKS)[number];

export const AIRTIME_MIN_NAIRA = 50;
export const AIRTIME_MAX_NAIRA = 50_000;

export function findNetwork(id: string): Network | undefined {
  return NETWORKS.find((n) => n.id === id);
}

/** Bundles sold on one network. */
export function plansForNetwork(networkId: string): DataPlan[] {
  const network = findNetwork(networkId);
  return network ? DATA_PLANS.filter((p) => p.network === network.name) : [];
}

/** A plan, only if it belongs to that network. */
export function findPlan(networkId: string, planId: string) {
  return plansForNetwork(networkId).find((p) => p.id === planId);
}

/** Local mobile number without the 0: "8012345678". */
export function isTopUpPhone(phone: string): boolean {
  return /^[789]\d{9}$/.test(phone);
}

/** "8012345678" -> "0801 234 5678" */
export function formatLocalPhone(phone: string): string {
  const d = `0${phone}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

/** Why an airtime amount (whole naira) isn't allowed, or null. */
export function airtimeAmountError(naira: number | null): string | null {
  if (naira === null || !Number.isInteger(naira) || naira <= 0) {
    return "Enter an amount in naira, e.g. 500";
  }
  if (naira < AIRTIME_MIN_NAIRA)
    return `Minimum amount is ₦${AIRTIME_MIN_NAIRA}`;
  if (naira > AIRTIME_MAX_NAIRA) {
    return `Maximum amount is ₦${groupThousands(AIRTIME_MAX_NAIRA)}`;
  }
  return null;
}

export interface TopUpOrder {
  kind: TopUpKind;
  network: Network;
  phone: string;
  amountMinor: number;
  plan?: DataPlan;
  /** Shown in activity and on the receipt. */
  note: string;
}

/**
 * Turn raw choices into a priced order, or explain what's wrong. This is the
 * single source of truth for what a top-up costs.
 */
export function priceTopUp(input: {
  kind: TopUpKind;
  network: string;
  phone: string;
  amount?: string;
  planId?: string;
}): { ok: true; order: TopUpOrder } | { ok: false; error: string } {
  const network = findNetwork(input.network);
  if (!network) return { ok: false, error: "Choose a network" };
  if (!isTopUpPhone(input.phone)) {
    return { ok: false, error: "Enter a valid Nigerian mobile number" };
  }
  const to = formatLocalPhone(input.phone);

  if (input.kind === "airtime") {
    const naira = /^\d+$/.test(input.amount ?? "")
      ? Number(input.amount)
      : null;
    const err = airtimeAmountError(naira);
    if (err || naira === null)
      return { ok: false, error: err ?? "Invalid amount" };
    return {
      ok: true,
      order: {
        kind: "airtime",
        network,
        phone: input.phone,
        amountMinor: naira * 100,
        note: `${network.name} airtime · ${to}`,
      },
    };
  }

  const plan = findPlan(network.id, input.planId ?? "");
  if (!plan) return { ok: false, error: "Choose a data bundle" };
  return {
    ok: true,
    order: {
      kind: "data",
      network,
      phone: input.phone,
      amountMinor: plan.priceNaira * 100,
      plan,
      note: `${network.name} ${plan.data} data · ${to}`,
    },
  };
}
