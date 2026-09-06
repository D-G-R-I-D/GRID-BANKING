import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "demo@grid.bank";
  const passwordHash = await bcrypt.hash("demo-password-123", 12);

  await db.user.deleteMany({ where: { email } });

  const user = await db.user.create({
    data: {
      email,
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

  const [everyday, savings] = user.accounts;
  if (everyday && savings) {
    await db.transfer.create({
      data: {
        fromAccountId: everyday.id,
        toAccountId: savings.id,
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
