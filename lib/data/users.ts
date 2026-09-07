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
