"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { signInAction } from "./actions";
import type { FormState } from "@/lib/form";

const initial: FormState = {};

export default function SignInPage() {
  const [state, action, pending] = useActionState(signInAction, initial);

  return (
    <div>
      <h1 className="text-2xl">Sign in</h1>
      <p className="mt-2 text-sm text-ink-soft">Welcome back.</p>

      <form action={action} className="mt-8 flex flex-col gap-4">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={state.fieldErrors?.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />

        {state.error && (
          <p role="alert" className="text-sm text-critical">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        New here?{" "}
        <Link href="/sign-up" className="text-accent underline">
          Open an account
        </Link>
      </p>
    </div>
  );
}
