"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { usePinAction } from "@/components/use-pin-action";
import type { TransferState } from "./actions";

type Action = (
  prev: TransferState,
  formData: FormData,
) => Promise<TransferState>;

const initial: TransferState = {};

/** Shared compose → confirm (PIN) → receipt flow for both transfer forms. */
export function useTransferFlow(action: Action) {
  const router = useRouter();
  const { toast } = useToast();
  const flow = usePinAction(action, initial);
  const { transferId } = flow.state;

  useEffect(() => {
    if (transferId) {
      toast("Transfer successful");
      router.push(`/transfer/receipt/${transferId}`);
    }
  }, [transferId, router, toast]);

  return flow;
}
