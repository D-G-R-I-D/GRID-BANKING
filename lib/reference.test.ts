import { describe, expect, it } from "vitest";
import { transferReference } from "./reference";

describe("transferReference", () => {
  it("is deterministic for a given id", () => {
    const id = "clh2x9abc0000qwerty123456";
    expect(transferReference(id)).toBe(transferReference(id));
  });

  it("matches the GRD-XXXX-XXXX shape", () => {
    expect(transferReference("abc123")).toMatch(
      /^GRD-[0-9A-Z]{4}-[0-9A-Z]{4}$/,
    );
  });

  it("differs for different ids", () => {
    expect(transferReference("aaaaaa")).not.toBe(transferReference("bbbbbb"));
  });

  it("avoids ambiguous letters", () => {
    const ref = transferReference("some-transfer-id-here");
    expect(ref.replace("GRD-", "")).not.toMatch(/[ILOU]/);
  });
});
