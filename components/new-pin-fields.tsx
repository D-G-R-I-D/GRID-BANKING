"use client";

import { useState } from "react";
import { PinInput } from "@/components/ui/pin-input";
import { PIN_LENGTHS, isWeakPin, type PinLength } from "@/lib/pin";
import { cn } from "@/lib/cn";

/**
 * Choose 4 or 6 digits, then type the PIN twice. Posts `pin` and
 * `confirmPin`; the server re-validates. `onValidChange` lets the parent
 * enable its submit button only when the pair is acceptable.
 */
export function NewPinFields({
  fieldErrors,
  onValidChange,
}: {
  fieldErrors?: Record<string, string>;
  onValidChange: (valid: boolean) => void;
}) {
  const [length, setLength] = useState<PinLength>(4);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");

  const pinDone = pin.length === length;
  const weak = pinDone && isWeakPin(pin);
  const mismatch = confirm.length === length && confirm !== pin;

  function report(nextPin: string, nextConfirm: string, len: number) {
    onValidChange(
      nextPin.length === len && !isWeakPin(nextPin) && nextConfirm === nextPin,
    );
  }

  function chooseLength(len: PinLength) {
    setLength(len);
    setPin("");
    setConfirm("");
    report("", "", len);
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium text-ink">
          PIN length
        </legend>
        <div className="grid grid-cols-2 rounded-full border border-line bg-surface p-0.5 text-sm">
          {PIN_LENGTHS.map((len) => (
            <label
              key={len}
              className={cn(
                "cursor-pointer rounded-full py-2 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                length === len
                  ? "bg-accent text-accent-ink"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <input
                type="radio"
                name="pinLength"
                value={len}
                checked={length === len}
                onChange={() => chooseLength(len)}
                className="sr-only"
              />
              {len} digits
            </label>
          ))}
        </div>
      </fieldset>

      <PinInput
        key={`pin-${length}`}
        length={length}
        name="pin"
        label="New PIN"
        hint="Avoid obvious ones like 1234 or 0000."
        value={pin}
        onChange={(v) => {
          setPin(v);
          report(v, confirm, length);
        }}
        error={weak ? "Too easy to guess — pick another" : fieldErrors?.pin}
      />
      <PinInput
        key={`confirm-${length}`}
        length={length}
        name="confirmPin"
        label="Confirm PIN"
        value={confirm}
        onChange={(v) => {
          setConfirm(v);
          report(pin, v, length);
        }}
        error={mismatch ? "PINs don't match" : fieldErrors?.confirmPin}
      />
    </div>
  );
}
