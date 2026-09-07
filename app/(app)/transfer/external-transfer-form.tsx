"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Check, Users } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/toast";
import type { RecipientView } from "@/lib/view";
import {
  externalTransferAction,
  lookupRecipientAction,
  type TransferState,
} from "./actions";

const initial: TransferState = {};

export function ExternalTransferForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, action, pending] = useActionState(
    externalTransferAction,
    initial,
  );
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const [acct, setAcct] = useState("");
  const [recipient, setRecipient] = useState<RecipientView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [looking, startLookup] = useTransition();

  function onAcctChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setAcct(digits);
    setRecipient(null);
    setNotFound(false);
    if (digits.length === 10) {
      startLookup(async () => {
        const found = await lookupRecipientAction(digits);
        if (found) setRecipient(found);
        else setNotFound(true);
      });
    }
  }

  useEffect(() => {
    if (state.success) {
      toast(`Sent to ${recipient?.name ?? "recipient"}`);
      router.refresh();
    }
  }, [state, toast, router, recipient]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input
        type="hidden"
        name="idempotencyKey"
        defaultValue={idempotencyKey}
      />
      <input
        type="hidden"
        name="recipientAccountNumber"
        value={acct}
        readOnly
      />

      <Field
        label="Recipient account number"
        inputMode="numeric"
        placeholder="10 digits"
        value={acct}
        onChange={(e) => onAcctChange(e.target.value)}
        error={notFound ? "No GRID account with that number" : undefined}
        hint={looking ? "Checking…" : undefined}
      />

      {recipient && (
        <div className="pop flex items-center gap-3 rounded-md border border-line bg-accent-soft p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink">
            <Users size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {recipient.name}
            </p>
            <p className="tnum text-xs text-ink-faint">
              {recipient.accountNumber}
            </p>
          </div>
          <Check size={16} className="ml-auto text-positive" />
        </div>
      )}

      <Field
        label="Amount"
        name="amount"
        inputMode="decimal"
        placeholder="0.00"
        prefix="₦"
        required
        error={state.fieldErrors?.amount}
      />
      <Field
        label="Note (optional)"
        name="note"
        maxLength={140}
        error={state.fieldErrors?.note}
      />

      {state.error && (
        <p role="alert" className="text-sm text-critical">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" pending={pending} disabled={!recipient}>
        {pending ? (
          "Sending…"
        ) : recipient ? (
          `Send to ${recipient.name}`
        ) : (
          <>{looking && <Spinner size={14} />} Enter an account number</>
        )}
      </Button>
    </form>
  );
}
