import { redirect } from "next/navigation";
import { requireUserWithPin } from "@/lib/session";
import { getSpendableBalance } from "@/lib/services/topup-service";
import { priceTopUp, type TopUpKind } from "@/lib/topup";
import { TopUpConfirm } from "./top-up-confirm";

type Params = { [key: string]: string | string[] | undefined };
const str = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : "";

/** Review + PIN. The order is re-priced here from the URL, never trusted. */
export default async function TopUpConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const user = await requireUserWithPin();
  const params = await searchParams;
  const kind: TopUpKind = str(params.type) === "data" ? "data" : "airtime";
  const raw = {
    kind,
    network: str(params.network),
    phone: str(params.phone),
    amount: str(params.amount),
    planId: str(params.planId),
  };

  const priced = priceTopUp(raw);
  if (!priced.ok) redirect("/transfer/topup");
  const { order } = priced;

  return (
    <TopUpConfirm
      raw={raw}
      summary={{
        kind: order.kind,
        networkName: order.network.name,
        phone: order.phone,
        amountMinor: order.amountMinor,
        planLabel: order.plan
          ? `${order.plan.data} · ${order.plan.validity}`
          : null,
      }}
      balanceMinor={await getSpendableBalance(user.id)}
      pinLength={user.pinLength}
    />
  );
}
