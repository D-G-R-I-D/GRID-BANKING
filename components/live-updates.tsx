"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { formatMoney } from "@/lib/money";
import type { IncomingView } from "@/lib/view";

const POLL_MS = 15_000;
/**
 * Only poll while someone is actually using the app. Background refreshes
 * are requests too, so polling forever would keep the session alive and
 * defeat the idle timeout.
 */
const ACTIVE_WINDOW_MS = 2 * 60_000;

/**
 * Keeps balances and activity fresh without a reload: re-reads the page on a
 * short interval while you're active, and whenever you come back to the tab.
 * When new money from someone arrives, says so.
 */
export function LiveUpdates({ latest }: { latest: IncomingView | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const seen = useRef(latest?.id ?? null);

  useEffect(() => {
    if (latest && latest.id !== seen.current) {
      seen.current = latest.id;
      toast(`${formatMoney(latest.amountMinor)} from ${latest.from}`);
    }
  }, [latest, toast]);

  useEffect(() => {
    let lastInput = Date.now();
    const markActive = () => {
      lastInput = Date.now();
    };
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const onReturn = () => {
      markActive();
      refreshIfVisible();
    };

    const timer = window.setInterval(() => {
      if (Date.now() - lastInput < ACTIVE_WINDOW_MS) refreshIfVisible();
    }, POLL_MS);

    window.addEventListener("pointerdown", markActive);
    window.addEventListener("keydown", markActive);
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [router]);

  return null;
}
