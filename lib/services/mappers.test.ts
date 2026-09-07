import { describe, expect, it } from "vitest";
import type { Transfer } from "@prisma/client";
import { toActivityView } from "./mappers";

const base: Transfer = {
  id: "t1",
  fromAccountId: "flow",
  toAccountId: "vault",
  amountMinor: 5000,
  currency: "NGN",
  note: "Save",
  idempotencyKey: "k1",
  createdAt: new Date("2026-01-01T10:00:00Z"),
};

const names = new Map([
  ["flow", "Flow"],
  ["vault", "Vault"],
]);

describe("toActivityView", () => {
  it("reads an outgoing transfer from the sender's side", () => {
    const view = toActivityView(base, new Set(["flow"]), names);
    expect(view.direction).toBe("out");
    expect(view.amountMinor).toBe(-5000);
    expect(view.counterparty).toBe("Vault");
  });

  it("reads an incoming transfer from the receiver's side", () => {
    const view = toActivityView(base, new Set(["vault"]), names);
    expect(view.direction).toBe("in");
    expect(view.amountMinor).toBe(5000);
    expect(view.counterparty).toBe("Flow");
  });

  it("labels an unknown counterparty as External", () => {
    const view = toActivityView(base, new Set(["flow"]), new Map());
    expect(view.counterparty).toBe("External");
  });
});
