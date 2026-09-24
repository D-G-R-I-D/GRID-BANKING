"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopUpHeader } from "@/components/topup-header";
import { DATA_PLANS } from "@/lib/topup-data";

const FILTERS = ["All", "Daily", "Weekly", "Monthly"] as const;

export default function BundlePickerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const network = searchParams.get("network") ?? "";
  const phone = searchParams.get("phone") ?? "";

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filteredPlans =
    filter === "All" ? DATA_PLANS : DATA_PLANS.filter((p) => p.frequency === filter.toLowerCase());

  function selectPlan(planId: string) {
    const params = new URLSearchParams({ network, phone, planId });
    router.push(`/transfer/topup/data?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      <TopUpHeader
        title="Select Data Bundle"
        backHref={`/transfer/topup/data?network=${network}&phone=${phone}`}
      />

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-line bg-surface text-ink-soft"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {filteredPlans.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectPlan(p.id)}
            className="flex w-full items-center justify-between rounded-md border border-line bg-surface px-3 py-3 text-left hover:bg-surface-sunk"
          >
            <div>
              <p className="text-sm font-medium text-ink">
                {p.network} — {p.data}
              </p>
              <p className="text-xs text-ink-faint">{p.validity}</p>
            </div>
            <span className="text-sm font-semibold text-ink">
              ₦{p.priceNaira.toLocaleString()}
            </span>
          </button>
        ))}
        {filteredPlans.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-faint">No bundles in this category yet.</p>
        )}
      </div>
    </div>
  );
}
