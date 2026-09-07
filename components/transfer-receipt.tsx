"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Receipt } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MoneyAmount } from "@/components/money-amount";
import type { ReceiptView } from "@/lib/view";

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(text);
  // Fallback for non-secure contexts (LAN / http on mobile)
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  el.remove();
  return Promise.resolve();
}

export function TransferReceipt({ receipt }: { receipt: ReceiptView }) {
  const [copied, setCopied] = useState(false);

  const when = receipt.at.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows: { label: string; value: string }[] = [
    { label: "Reference", value: receipt.reference },
    { label: "Date", value: when },
    { label: "From", value: receipt.fromLabel },
    { label: "To", value: receipt.toLabel },
    ...(receipt.toAccountNumber
      ? [{ label: "Account number", value: receipt.toAccountNumber }]
      : []),
    ...(receipt.note ? [{ label: "Note", value: receipt.note }] : []),
    { label: "Status", value: "Successful" },
  ];

  async function share() {
    const text = [
      "GRID transfer receipt",
      ...rows.map((r) => `${r.label}: ${r.value}`),
      `Amount: ₦${(receipt.amountMinor / 100).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
      })}`,
    ].join("\n");
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <span className="pop grid h-14 w-14 place-items-center rounded-full bg-positive/15 text-positive">
        <Check size={28} />
      </span>

      <div className="text-center">
        <p className="text-sm text-ink-soft">
          {receipt.kind === "internal" ? "Moved to" : "Sent to"}{" "}
          {receipt.toLabel}
        </p>
        <p className="mt-1 text-3xl">
          <MoneyAmount
            minorUnits={receipt.amountMinor}
            currency={receipt.currency}
          />
        </p>
      </div>

      <dl className="w-full divide-y divide-line rounded-lg border border-line bg-surface">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
          >
            <dt className="text-ink-soft">{r.label}</dt>
            <dd
              className={
                r.label === "Status"
                  ? "font-medium text-positive"
                  : r.label === "Reference"
                    ? "tnum font-medium text-ink"
                    : "text-right font-medium text-ink"
              }
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={share}
          className="flex items-center justify-center gap-2 rounded-md border border-line py-2.5 text-sm text-ink-soft transition-colors hover:bg-surface-sunk"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Share receipt"}
        </button>
        <div className="flex gap-2">
          <Link href="/transfer" className="flex-1">
            <Button variant="ghost" className="w-full">
              <Receipt size={15} /> Send another
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">Done</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
