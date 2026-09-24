"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { TopUpHeader } from "@/components/topup-header";
import { DATA_PLANS, NETWORKS } from "@/lib/topup-data";

export function DataClient({
  phone,
  network,
  planId,
  balanceMinor,
}: {
  phone: string;
  network: string;
  planId: string;
  balanceMinor: number;
}) {
  const router = useRouter();
  const [balanceHidden, setBalanceHidden] = useState(true);

  const selectedPlan = DATA_PLANS.find((p) => p.id === planId);
  const selectedNetwork = NETWORKS.find((n) => n.id === network);
  const planPriceMinor = selectedPlan ? selectedPlan.priceNaira * 100 : 0;
  const insufficientForPlan = !!selectedPlan && planPriceMinor > balanceMinor;
  const canProceed = !!selectedPlan && !insufficientForPlan;

  function goToBundlePicker() {
    const params = new URLSearchParams({ network, phone });
    if (planId) params.set("planId", planId);
    router.push(`/transfer/topup/data/bundle?${params.toString()}`);
  }

  function handleContinue() {
    if (!canProceed) return;
    const params = new URLSearchParams({
      type: "data",
      network,
      phone,
      planId,
    });
    router.push(`/transfer/topup/pin?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      <TopUpHeader
        title="Buy Data"
        backHref={`/transfer/topup?type=data&network=${network}&phone=${phone}`}
      />

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-3">
          <span
            className="grid h-9 w-9 place-items-center rounded-full text-center text-[9px] font-semibold leading-[1.1]"
            style={{
              backgroundColor: selectedNetwork?.bg,
              color: selectedNetwork?.fg,
            }}
          >
            {selectedNetwork?.initials}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">+234 {phone}</p>
            <p className="text-xs text-ink-faint">{selectedNetwork?.name}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">
            Account to Debit
          </span>
          <div className="rounded-md bg-accent px-4 py-3 text-accent-ink">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {balanceHidden ? "₦••••" : formatMoney(balanceMinor, "NGN")}
              </span>
              <button
                type="button"
                onClick={() => setBalanceHidden((v) => !v)}
                aria-label="Toggle balance visibility"
                className="text-accent-ink/70 hover:text-accent-ink"
              >
                {balanceHidden ? "👁" : "🙈"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Data Bundle</span>
          <button
            type="button"
            onClick={goToBundlePicker}
            className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2.5 text-left text-sm text-ink"
          >
            {selectedPlan ? (
              `${selectedPlan.data} — ₦${selectedPlan.priceNaira.toLocaleString()} (${selectedPlan.validity})`
            ) : (
              <span className="text-ink-faint">Select data bundle</span>
            )}
            <span className="text-ink-faint">▾</span>
          </button>
        </div>

        {insufficientForPlan && (
          <span className="text-xs text-critical">
            Insufficient balance. You have {formatMoney(balanceMinor, "NGN")}
          </span>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canProceed}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
