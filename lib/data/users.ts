import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Data-access for the User table. Returns Prisma rows; callers map to views. */

export function findUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email, isSystem: false } });
}

/** Sign-in by account number (never a GRID house account). */
export function findUserByAccountNumber(accountNumber: string) {
  return db.user.findUnique({ where: { accountNumber, isSystem: false } });
}

export function findUserByEmailOrPhone(email: string, phone: string) {
  return db.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { id: true },
  });
}

/** Resolve a recipient by account number, including their Flow account id. */
export function findRecipientByAccountNumber(accountNumber: string) {
  return db.user.findUnique({
    where: { accountNumber, isSystem: false },
    select: {
      id: true,
      name: true,
      accounts: { where: { kind: "FLOW" }, select: { id: true }, take: 1 },
    },
  });
}

interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  passwordHash: string;
}

export function createUser(input: CreateUserInput) {
  return db.user.create({ data: input });
}

// --- Transaction PIN ---------------------------------------------------------

export function findUserPin(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      pinHash: true,
      pinLength: true,
      pinFailedAttempts: true,
      pinLockedUntil: true,
    },
  });
}

/** Set (or replace) the PIN and clear any lockout. */
export function savePin(id: string, pinHash: string, pinLength: number) {
  return db.user.update({
    where: { id },
    data: { pinHash, pinLength, pinFailedAttempts: 0, pinLockedUntil: null },
  });
}

/** Count a PIN attempt atomically; returns the new count. */
export async function countPinAttempt(id: string): Promise<number> {
  const row = await db.user.update({
    where: { id },
    data: { pinFailedAttempts: { increment: 1 } },
    select: { pinFailedAttempts: true },
  });
  return row.pinFailedAttempts;
}

export function lockPin(id: string, until: Date) {
  return db.user.update({
    where: { id },
    data: { pinFailedAttempts: 0, pinLockedUntil: until },
  });
}

export function clearPinAttempts(id: string) {
  return db.user.update({
    where: { id },
    data: { pinFailedAttempts: 0, pinLockedUntil: null },
  });
}

// --- Identity (BVN / NIN) ---------------------------------------------------------

export function findUserIdentity(id: string) {
  return db.user.findUnique({
    where: { id },
    select: { bvnLast4: true, ninLast4: true, kycSnoozedUntil: true },
  });
}

export function updateUserIdentity(id: string, data: Prisma.UserUpdateInput) {
  return db.user.update({ where: { id }, data });
}

export function snoozeIdentityPrompt(id: string, until: Date) {
  return db.user.update({ where: { id }, data: { kycSnoozedUntil: until } });
}
