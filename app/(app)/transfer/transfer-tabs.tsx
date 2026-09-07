"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { AccountView } from "@/lib/view";
import { InternalTransferForm } from "./internal-transfer-form";
import { ExternalTransferForm } from "./external-transfer-form";

type Tab = "internal" | "external";

export function TransferTabs({
  accounts,
  stepUpActive,
}: {
  accounts: AccountView[];
  stepUpActive: boolean;
}) {
  const [tab, setTab] = useState<Tab>("internal");

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Transfer type"
        className="grid grid-cols-2 rounded-full border border-line bg-surface p-0.5 text-sm"
      >
        <button
          role="tab"
          aria-selected={tab === "internal"}
          onClick={() => setTab("internal")}
          className={cn(
            "rounded-full py-2 transition-colors",
            tab === "internal"
              ? "bg-accent text-accent-ink"
              : "text-ink-soft hover:text-ink",
          )}
        >
          My accounts
        </button>
        <button
          role="tab"
          aria-selected={tab === "external"}
          onClick={() => setTab("external")}
          className={cn(
            "rounded-full py-2 transition-colors",
            tab === "external"
              ? "bg-accent text-accent-ink"
              : "text-ink-soft hover:text-ink",
          )}
        >
          Someone else
        </button>
      </div>

      {tab === "internal" ? (
        <InternalTransferForm accounts={accounts} stepUpActive={stepUpActive} />
      ) : (
        <ExternalTransferForm stepUpActive={stepUpActive} />
      )}
    </div>
  );
}
