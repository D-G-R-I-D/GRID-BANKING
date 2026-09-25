"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PinInput } from "@/components/ui/pin-input";
import { useToast } from "@/components/toast";
import { maskIdentity } from "@/lib/identity";
import { saveIdentityAction, type IdentityState } from "./actions";

const initial: IdentityState = {};
const digitsOnly = (v: string) => v.replace(/\D/g, "").slice(0, 11);

export function IdentityForm({
  bvnLast4,
  ninLast4,
  pinLength,
}: {
  bvnLast4: string | null;
  ninLast4: string | null;
  pinLength: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, action, pending] = useActionState(saveIdentityAction, initial);
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");

  useEffect(() => {
    if (state.done) {
      toast("Identity details saved");
      router.push("/settings");
    }
  }, [state.done, router, toast]);

  const ready = bvn.length === 11 || nin.length === 11;

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field
        label="BVN"
        name="bvn"
        inputMode="numeric"
        autoComplete="off"
        placeholder={bvnLast4 ? maskIdentity(bvnLast4) : "11 digits"}
        value={bvn}
        onChange={(e) => setBvn(digitsOnly(e.target.value))}
        hint={
          bvnLast4
            ? "Added. Enter a new one only to replace it."
            : "Dial *565*0# on the phone number linked to your bank."
        }
        error={state.fieldErrors?.bvn}
      />
      <Field
        label="NIN"
        name="nin"
        inputMode="numeric"
        autoComplete="off"
        placeholder={ninLast4 ? maskIdentity(ninLast4) : "11 digits"}
        value={nin}
        onChange={(e) => setNin(digitsOnly(e.target.value))}
        hint={
          ninLast4
            ? "Added. Enter a new one only to replace it."
            : "On your NIN slip or the NIMC app, or dial *346#."
        }
        error={state.fieldErrors?.nin}
      />

      <PinInput
        length={pinLength}
        name="pin"
        label="Transaction PIN"
        hint="Confirm it's you."
        error={state.fieldErrors?.pin}
      />

      {state.error && (
        <p role="alert" className="text-sm text-critical">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" pending={pending} disabled={!ready}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
