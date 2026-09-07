import "server-only";
import { db } from "@/lib/db";

/** Data-access for the User table. Returns Prisma rows; callers map to views. */

export function findUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
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
    where: { accountNumber },
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
