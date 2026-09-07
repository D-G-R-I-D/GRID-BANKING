import type { z } from "zod";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

/** Take the first message per field from a Zod error. */
export function firstFieldErrors(error: z.ZodError): Record<string, string> {
  const flat = error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(flat).map(([key, msgs]) => [key, msgs?.[0] ?? "Invalid"]),
  );
}
