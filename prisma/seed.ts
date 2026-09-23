import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "demo@grid.bank";
  const phone = "+2348012345678";
  const passwordHash = await bcrypt.hash("demo-password-123", 12);
  const pin = "2580";
  const pinHash = await bcrypt.hash(pin, 12);

  // Never touch an existing demo user's money. Deleting its transfers used
  // to "refund" it while the people it had paid kept the money, leaving the
  // ledger out of balance. Re-running only backfills a missing PIN. For a
  // truly clean slate use `npm run db:reset`.
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.pinHash) {
      await db.user.update({
        where: { id: existing.id },
        data: { pinHash, pinLength: pin.length },
      });
    }
    console.warn(`${email} already exists — left as is · PIN ${pin}`);
    return;
  }

  const user = await db.user.create({
    data: {
      email,
      phone,
      accountNumber: phone.slice(-10),
      name: "Demo Person",
      passwordHash,
      pinHash,
      pinLength: pin.length,
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

  console.warn(`Seeded ${email} / demo-password-123 · PIN ${pin}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
