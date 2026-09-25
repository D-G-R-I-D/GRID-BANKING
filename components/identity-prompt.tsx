"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Lock } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { snoozeIdentityPromptAction } from "@/app/(app)/actions";

const DELAY_MS = 8_000;
const SEEN_KEY = "grid-identity-prompt-seen";

/**
 * A gentle nudge to add BVN & NIN, a few seconds after landing on the
 * dashboard. Non-blocking (a sheet, not a modal), once per browser session;
 * "Not now" also snoozes it for a week across devices.
 */
export function IdentityPrompt({ due }: { due: boolean }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const firstButton = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!due) return;
    const timer = window.setTimeout(() => {
      try {
        if (sessionStorage.getItem(SEEN_KEY)) return;
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage blocked: just show it */
      }
      setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [due]);

  useEffect(() => {
    if (!open) return;
    firstButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  function notNow() {
    setOpen(false);
    startTransition(() => snoozeIdentityPromptAction());
  }

  return (
    <div
      role="dialog"
      aria-labelledby="identity-prompt-title"
      className="toast-in fixed inset-x-0 bottom-20 z-20 mx-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-surface p-4 shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
          <Lock size={16} />
        </span>
        <div className="min-w-0">
          <p
            id="identity-prompt-title"
            className="text-sm font-medium text-ink"
          >
            Add your BVN &amp; NIN
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            Borrow up to ₦2,000,000 instead of ₦500,000. Optional — takes a
            minute.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={notNow}
        >
          Not now
        </Button>
        <Link
          ref={firstButton}
          href="/settings/identity"
          onClick={() => setOpen(false)}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-ink hover:opacity-90"
        >
          Add now
        </Link>
      </div>
    </div>
  );
}
