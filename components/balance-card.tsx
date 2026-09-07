"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "@/components/icons";
import { formatMoney } from "@/lib/money";
import { maskAccountNumber } from "@/lib/phone";

interface BalanceCardProps {
  balanceMinor: number;
  currency: string;
  accountNumber: string;
  firstName: string;
}

export function BalanceCard({
  balanceMinor,
  currency,
  accountNumber,
  firstName,
}: BalanceCardProps) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <section className="rounded-lg bg-card p-5 text-card-ink shadow-[var(--shadow-md)]">
      <p className="text-sm text-card-ink-soft">Good day, {firstName}</p>

      <p className="mt-3 text-xs uppercase tracking-wide text-card-ink-soft">
        Total balance
      </p>
      <p className="tnum mt-1 text-[2rem] leading-none">
        {shown ? formatMoney(balanceMinor, currency) : "₦ ••••••"}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-card-line pt-3">
        <div>
          <p className="text-[0.7rem] uppercase tracking-wide text-card-ink-soft">
            Account number
          </p>
          <p className="tnum text-sm">
            {shown ? accountNumber : maskAccountNumber(accountNumber)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-pressed={shown}
            aria-label={shown ? "Hide balance" : "Show balance"}
            className="rounded-md p-2 text-card-ink-soft transition-colors hover:text-card-ink"
          >
            {shown ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy account number"
            className="rounded-md p-2 text-card-ink-soft transition-colors hover:text-card-ink"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </section>
  );
}
