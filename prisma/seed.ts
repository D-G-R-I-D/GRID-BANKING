import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "demo@grid.bank";
  const phone = "+2348012345678";
  const passwordHash = await bcrypt.hash("demo-password-123", 12);

  // Clean any previous demo data in FK-safe order so the seed is re-runnable.
  const existing = await db.user.findUnique({
    where: { email },
    include: { accounts: true },
  });
  if (existing) {
    const accountIds = existing.accounts.map((a) => a.id);
    await db.transfer.deleteMany({
      where: {
        OR: [
          { fromAccountId: { in: accountIds } },
          { toAccountId: { in: accountIds } },
        ],
      },
    });
    await db.account.deleteMany({ where: { userId: existing.id } });
    await db.user.delete({ where: { id: existing.id } });
  }

  const user = await db.user.create({
    data: {
      email,
      phone,
      accountNumber: phone.slice(-10),
      name: "Demo Person",
      passwordHash,
      accounts: {
        create: [
          { name: "Flow", kind: "FLOW", balanceMinor: 184_200_00 },
          { name: "Vault", kind: "VAULT", balanceMinor: 650_000_00 },
        ],
      },
    },
    include: { accounts: true },
  });

  const [flow, vault] = user.accounts;
  if (flow && vault) {
    await db.transfer.create({
      data: {
        fromAccountId: flow.id,
        toAccountId: vault.id,
        amountMinor: 20_000_00,
        currency: "NGN",
        note: "Monthly save",
        idempotencyKey: crypto.randomUUID(),
      },
    });
  }

  console.warn(`Seeded ${email} / demo-password-123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
