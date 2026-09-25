"use client";

import { useActionState, useMemo, useState } from "react";
import { newIdempotencyKey } from "@/lib/id";

/**
 * State for a compose → confirm-with-PIN form. Wraps useActionState and
 * counts submissions so the PIN boxes can be cleared after each attempt
 * (pass `pinKey` to <ConfirmStep>). One idempotency key per mounted form, so
 * a double-click can't double-send.
 *
 * `onSettled` runs as soon as the action returns — before any re-render —
 * so it still fires if the revalidated page remounts this form.
 */
export function usePinAction<S extends object>(
  action: (prev: S, formData: FormData) => Promise<S>,
  initial: S,
  onSettled?: (state: S) => void,
) {
  const [counted, formAction, pending] = useActionState<
    { state: S; submission: number },
    FormData
  >(
    async (prev, formData) => {
      const state = await action(prev.state, formData);
      onSettled?.(state);
      return { state, submission: prev.submission + 1 };
    },
    { state: initial, submission: 0 },
  );
  const [confirming, setConfirming] = useState(false);
  const idempotencyKey = useMemo(() => newIdempotencyKey(), []);

  return {
    state: counted.state,
    pinKey: counted.submission,
    formAction,
    pending,
    confirming,
    setConfirming,
    idempotencyKey,
  };
}
