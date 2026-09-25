import "server-only";
import { createHmac } from "node:crypto";
import { Prisma } from "@prisma/client";
import {
  identityComplete,
  loanLimitFor,
  type IdentityKind,
  type IdentityStatus,
} from "@/lib/identity";
import {
  findUserIdentity,
  snoozeIdentityPrompt as snoozeInDb,
  updateUserIdentity,
} from "@/lib/data/users";
import type { IdentityView } from "@/lib/view";

const SNOOZE_DAYS = 7;

/**
 * Keyed one-way fingerprint of a BVN/NIN. Lets the database refuse the same
 * number on two accounts without ever storing the number itself.
 */
function fingerprint(kind: IdentityKind, value: string): string {
  const secret = process.env.IDENTITY_HASH_SECRET ?? process.env.SESSION_SECRET;
  if (!secret)
    throw new Error("IDENTITY_HASH_SECRET or SESSION_SECRET must be set");
  return createHmac("sha256", secret).update(`${kind}:${value}`).digest("hex");
}

export async function getIdentity(userId: string): Promise<IdentityView> {
  const row = await findUserIdentity(userId);
  const status: IdentityStatus = {
    bvnLast4: row?.bvnLast4 ?? null,
    ninLast4: row?.ninLast4 ?? null,
  };
  const complete = identityComplete(status);
  const snoozed =
    row?.kycSnoozedUntil != null && row.kycSnoozedUntil.getTime() > Date.now();
  return {
    ...status,
    complete,
    loanLimitMinor: loanLimitFor(status),
    promptDue: !complete && !snoozed,
  };
}

export type IdentityResult =
  { ok: true } | { ok: false; field: IdentityKind | null; error: string };

/** Add or replace BVN and/or NIN. Only the fingerprint and last 4 are kept. */
export async function saveIdentity(
  userId: string,
  input: { bvn?: string; nin?: string },
): Promise<IdentityResult> {
  const data: Prisma.UserUpdateInput = {};
  if (input.bvn) {
    data.bvnHash = fingerprint("bvn", input.bvn);
    data.bvnLast4 = input.bvn.slice(-4);
  }
  if (input.nin) {
    data.ninHash = fingerprint("nin", input.nin);
    data.ninLast4 = input.nin.slice(-4);
  }

  try {
    await updateUserIdentity(userId, data);
    return { ok: true };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = String(err.meta?.target ?? "");
      const field: IdentityKind = target.includes("nin") ? "nin" : "bvn";
      return {
        ok: false,
        field,
        error: `This ${field.toUpperCase()} is already linked to another account`,
      };
    }
    return { ok: false, field: null, error: "Couldn't save that. Try again." };
  }
}

/** "Not now" on the dashboard prompt: don't ask again for a week. */
export async function snoozeIdentityPrompt(userId: string): Promise<void> {
  await snoozeInDb(userId, new Date(Date.now() + SNOOZE_DAYS * 86_400_000));
}
