"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { NewPinFields } from "@/components/new-pin-fields";
import type { FormState } from "@/lib/form";
import { setPinAction } from "./actions";

const initial: FormState = {};

export function SetPinForm() {
  const [state, action, pending] = useActionState(setPinAction, initial);
  const [valid, setValid] = useState(false);

  return (
    <form action={action} className="mt-8 flex flex-col gap-6">
      <NewPinFields fieldErrors={state.fieldErrors} onValidChange={setValid} />

      {state.error && (
        <p role="alert" className="text-sm text-critical">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" pending={pending} disabled={!valid}>
        {pending ? "Saving…" : "Create PIN"}
      </Button>
    </form>
  );
}
