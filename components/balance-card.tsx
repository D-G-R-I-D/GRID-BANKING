"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "@/components/icons";
import { formatMoney } from "@/lib/money";
import { maskAccountNumber } from "@/lib/phone";
import { copyText } from "@/lib/clipboard";
import { useToast } from "@/components/toast";

interface BalanceCardProps {
  balanceMinor: number;
  currency: string;
  accountNumber: string;
  firstName: string;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const iconBtn =
  "grid h-9 w-9 place-items-center rounded-full text-card-ink-soft transition-colors hover:bg-white/5 hover:text-card-ink active:scale-95";

export function BalanceCard({
  balanceMinor,
  currency,
  accountNumber,
  firstName,
}: BalanceCardProps) {
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(accountNumber);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast("Account number copied");
    } else {
      toast("Couldn't copy — long-press to select", "error");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-lg bg-card p-5 text-card-ink shadow-[var(--shadow-md)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.04] blur-2xl" />

      <p className="text-sm text-card-ink-soft">
        {greeting()}, {firstName}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <p className="text-xs uppercase tracking-wide text-card-ink-soft">
          Total balance
        </p>
        <button
          type="button"
          onClick={() => setShowBalance((v) => !v)}
          aria-pressed={showBalance}
          aria-label={showBalance ? "Hide balance" : "Show balance"}
          className="grid h-6 w-6 place-items-center rounded-full text-card-ink-soft transition-colors hover:text-card-ink active:scale-95"
        >
          {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
      <p className="tnum mt-1 text-[2rem] leading-none">
        {showBalance ? formatMoney(balanceMinor, currency) : "₦ ••••••"}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-card-line pt-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-wide text-card-ink-soft">
            Account number
          </p>
          <p className="tnum text-sm">
            {showAccount ? accountNumber : maskAccountNumber(accountNumber)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowAccount((v) => !v)}
            aria-pressed={showAccount}
            aria-label={
              showAccount ? "Hide account number" : "Show account number"
            }
            className={iconBtn}
          >
            {showAccount ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy account number"
            className={iconBtn}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </section>
  );
}
