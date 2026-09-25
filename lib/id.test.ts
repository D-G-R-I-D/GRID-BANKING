import { afterEach, describe, expect, it, vi } from "vitest";
import { newIdempotencyKey } from "./id";

const V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("newIdempotencyKey", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a v4 UUID", () => {
    expect(newIdempotencyKey()).toMatch(V4);
  });

  it("still works where crypto.randomUUID is missing (http on a phone)", () => {
    const real = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: (a: Uint8Array) => real.getRandomValues(a),
    });
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).toMatch(V4);
    expect(a).not.toBe(b);
  });
});
