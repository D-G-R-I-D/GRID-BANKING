"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, Receipt, Share } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MoneyAmount } from "@/components/money-amount";
import { useToast } from "@/components/toast";
import type { ReceiptView } from "@/lib/view";
import { formatDateTime } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { copyText } from "@/lib/clipboard";
import { renderReceiptPng } from "@/lib/receipt-image";

type Busy = "share" | "save" | "copy" | null;

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function TransferReceipt({ receipt }: { receipt: ReceiptView }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<Busy>(null);
  const [copied, setCopied] = useState(false);

  const when = formatDateTime(receipt.at);
  const headline = `${receipt.kind === "internal" ? "Moved to" : "Sent to"} ${receipt.toLabel}`;
  const amount = formatMoney(receipt.amountMinor, receipt.currency);
  const filename = `grid-pay-receipt-${receipt.reference}.png`;

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

  const asText = () =>
    [
      "GRID • PAY receipt",
      headline,
      `Amount: ${amount}`,
      ...rows.map((r) => `${r.label}: ${r.value}`),
    ].join("\n");
  const image = () => renderReceiptPng({ headline, amount, rows });

  /** The share sheet (WhatsApp, Mail…) with the image; else save it. */
  async function share() {
    setBusy("share");
    try {
      const blob = await image();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "GRID • PAY receipt",
          text: headline,
        });
      } else {
        // Sharing files needs https; on http (e.g. a LAN demo) save instead.
        saveBlob(blob, filename);
        toast("Receipt saved as an image");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        toast("Couldn't share that", "error");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    try {
      saveBlob(await image(), filename);
      toast("Receipt saved as an image");
    } catch {
      toast("Couldn't save the image", "error");
    } finally {
      setBusy(null);
    }
  }

  /** Copy the picture where the browser allows it, otherwise the text. */
  async function copy() {
    setBusy("copy");
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        // Pass the promise straight in: Safari needs the item created in the tap.
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": image() }),
        ]);
        toast("Receipt image copied");
      } else if (await copyText(asText())) {
        toast("Receipt copied as text");
      } else {
        throw new Error("copy failed");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Couldn't copy — try Save image", "error");
    } finally {
      setBusy(null);
    }
  }

  const action =
    "flex flex-1 flex-col items-center gap-1.5 rounded-md border border-line bg-surface py-3 text-xs text-ink-soft transition-colors hover:bg-surface-sunk disabled:opacity-60";

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <span className="pop grid h-14 w-14 place-items-center rounded-full bg-positive/15 text-positive">
        <Check size={28} />
      </span>

      <div className="text-center">
        <p className="text-sm text-ink-soft">{headline}</p>
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
        <div
          className="flex gap-2"
          role="group"
          aria-label="Share this receipt"
        >
          <button
            type="button"
            onClick={share}
            disabled={busy !== null}
            className={action}
          >
            <Share size={17} className="text-accent" />
            {busy === "share" ? "Preparing…" : "Share"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy !== null}
            className={action}
          >
            <Download size={17} className="text-accent" />
            {busy === "save" ? "Saving…" : "Save image"}
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={busy !== null}
            className={action}
          >
            {copied ? (
              <Check size={17} className="text-positive" />
            ) : (
              <Copy size={17} className="text-accent" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
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
