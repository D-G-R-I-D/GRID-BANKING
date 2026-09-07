"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { signUpAction } from "./actions";
import type { FormState } from "@/lib/form";

const initial: FormState = {};

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpAction, initial);

  return (
    <div>
      <h1 className="text-2xl">Open your account</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Your phone number becomes your account number.
      </p>

      <form action={action} className="mt-8 flex flex-col gap-4">
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          required
          error={state.fieldErrors?.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={state.fieldErrors?.email}
        />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="0803 123 4567"
          required
          hint="Nigerian mobile number."
          error={state.fieldErrors?.phone}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 10 characters."
          error={state.fieldErrors?.password}
        />

        {state.error && (
          <p role="alert" className="text-sm text-critical">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="mt-2">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already with GRID?{" "}
        <Link href="/sign-in" className="text-accent underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
