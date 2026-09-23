"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NewPinFields } from "@/components/new-pin-fields";
import { useToast } from "@/components/toast";
import { changePinAction, type ChangePinState } from "./actions";

const initial: ChangePinState = {};

export function ChangePinForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, action, pending] = useActionState(changePinAction, initial);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (state.done) {
      toast("PIN updated");
      router.push("/settings");
    }
  }, [state.done, router, toast]);

  return (
    <form action={action} className="flex flex-col gap-6">
      <Field
        label="Your password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        hint="The one you sign in with — so this works even if you've forgotten your PIN."
        error={state.fieldErrors?.password}
      />

      <NewPinFields fieldErrors={state.fieldErrors} onValidChange={setValid} />

      {state.error && (
        <p role="alert" className="text-sm text-critical">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" pending={pending} disabled={!valid}>
        {pending ? "Saving…" : "Update PIN"}
      </Button>
    </form>
  );
}
