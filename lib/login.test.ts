import { describe, expect, it } from "vitest";
import { parseLoginIdentifier } from "./login";

describe("parseLoginIdentifier", () => {
  it("reads an email, case-insensitively", () => {
    expect(parseLoginIdentifier("  Demo@Grid.Bank ")).toEqual({
      kind: "email",
      email: "demo@grid.bank",
    });
  });

  it("reads a 10-digit account number", () => {
    expect(parseLoginIdentifier("8012345678")).toEqual({
      kind: "account",
      accountNumber: "8012345678",
    });
  });

  it("accepts the phone number the account number came from", () => {
    for (const phone of ["08012345678", "+2348012345678", "0801 234 5678"]) {
      expect(parseLoginIdentifier(phone)).toEqual({
        kind: "account",
        accountNumber: "8012345678",
      });
    }
  });

  it("rejects anything else", () => {
    for (const bad of ["", "hello", "12345", "1012345678"]) {
      expect(parseLoginIdentifier(bad)).toBeNull();
    }
  });
});
