"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "@/components/icons";
import { formatMoney } from "@/lib/money";
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

function groupNumber(n: string): string {
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

const iconBtn =
  "grid h-9 w-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white active:scale-95";

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
    <section
      className="relative isolate overflow-hidden rounded-lg p-5 text-white shadow-[var(--shadow-md)]"
      style={{
        background:
          "radial-gradient(120% 120% at 100% 0%, #2b2d5c 0%, #1a1b32 45%, #101018 100%)",
      }}
    >
      {/* sheen */}
      <div className="pointer-events-none absolute -left-1/3 -top-1/2 -z-10 h-[200%] w-2/3 rotate-12 bg-white/[0.06] blur-2xl" />

      <div className="flex items-start justify-between">
        <p className="text-sm text-white/60">
          {greeting()}, {firstName}
        </p>
        <span className="font-serif text-sm tracking-tight text-white/80">
          GRID
        </span>
      </div>

      {/* chip */}
      <div className="mt-4 h-7 w-10 rounded-[5px] bg-gradient-to-br from-[#d8c48a] to-[#a98f4d]" />

      <div className="mt-4 flex items-center gap-2">
        <p className="text-[0.7rem] uppercase tracking-widest text-white/50">
          Balance
        </p>
        <button
          type="button"
          onClick={() => setShowBalance((v) => !v)}
          aria-pressed={showBalance}
          aria-label={showBalance ? "Hide balance" : "Show balance"}
          className="grid h-6 w-6 place-items-center rounded-full text-white/60 transition-colors hover:text-white active:scale-95"
        >
          {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
      <p className="tnum mt-0.5 text-[2rem] leading-none">
        {showBalance ? formatMoney(balanceMinor, currency) : "₦ ••••••"}
      </p>

      <div className="mt-6 flex items-end justify-between">
        <div className="min-w-0">
          <p className="text-[0.65rem] uppercase tracking-widest text-white/45">
            Account number
          </p>
          <p className="tnum mt-1 text-[0.95rem] tracking-[0.15em] text-white/90">
            {showAccount ? groupNumber(accountNumber) : "••• ••• ••••"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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
