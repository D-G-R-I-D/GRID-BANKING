import { describe, expect, it } from "vitest";
import type { TransferWithParties } from "@/lib/data/transfers";
import { toActivityView } from "./mappers";

function makeTransfer(
  overrides: Partial<TransferWithParties> = {},
): TransferWithParties {
  return {
    id: "t1",
    fromAccountId: "flow-a",
    toAccountId: "vault-a",
    amountMinor: 5000,
    currency: "NGN",
    note: "Save",
    idempotencyKey: "k1",
    createdAt: new Date("2026-01-01T10:00:00Z"),
    fromAccount: { id: "flow-a", name: "Flow", user: { name: "Ada" } },
    toAccount: { id: "vault-a", name: "Vault", user: { name: "Ada" } },
    ...overrides,
  } as TransferWithParties;
}

describe("toActivityView", () => {
  it("between my own accounts: shows the other account's name", () => {
    const view = toActivityView(makeTransfer(), new Set(["flow-a", "vault-a"]));
    expect(view.direction).toBe("out");
    expect(view.amountMinor).toBe(-5000);
    expect(view.counterparty).toBe("Vault");
  });

  it("outgoing to someone else: shows the recipient's name", () => {
    const t = makeTransfer({
      toAccountId: "flow-b",
      toAccount: { id: "flow-b", name: "Flow", user: { name: "Bem" } },
    });
    const view = toActivityView(t, new Set(["flow-a"]));
    expect(view.direction).toBe("out");
    expect(view.counterparty).toBe("Bem");
  });

  it("incoming from someone else: shows the sender's name", () => {
    const t = makeTransfer({
      fromAccountId: "flow-b",
      fromAccount: { id: "flow-b", name: "Flow", user: { name: "Bem" } },
    });
    const view = toActivityView(t, new Set(["vault-a"]));
    expect(view.direction).toBe("in");
    expect(view.amountMinor).toBe(5000);
    expect(view.counterparty).toBe("Bem");
  });
});
