import { hasStepUp, requireUser } from "@/lib/session";
import { getTransferTargets } from "@/lib/services/transfer-service";
import { TransferTabs } from "./transfer-tabs";

export default async function TransferPage() {
  const user = await requireUser();
  const [{ accounts }, stepUpActive] = await Promise.all([
    getTransferTargets(user.id),
    hasStepUp(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl">Move money</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Between your accounts, or to any GRID account number.
        </p>
      </div>
      <TransferTabs accounts={accounts} stepUpActive={stepUpActive} />
    </div>
  );
}
