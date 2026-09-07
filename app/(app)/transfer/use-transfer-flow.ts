"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import type { TransferState } from "./actions";

type Action = (
  prev: TransferState,
  formData: FormData,
) => Promise<TransferState>;

const initial: TransferState = {};

/** Shared compose → confirm → receipt flow for both transfer forms. */
export function useTransferFlow(action: Action) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState(action, initial);
  const [confirming, setConfirming] = useState(false);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    if (state.transferId) {
      toast("Transfer successful");
      router.push(`/transfer/receipt/${state.transferId}`);
    } else if (state.error || state.fieldErrors?.password) {
      // Re-read the page so a now-valid step-up drops the password field.
      // (The user is already on the confirm step — that's where submit lives.)
      router.refresh();
    }
  }, [state, router, toast]);

  return {
    state,
    formAction,
    pending,
    confirming,
    setConfirming,
    idempotencyKey,
  };
}
